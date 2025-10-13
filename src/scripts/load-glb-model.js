import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';

export async function initGLBScene(container, modelUrl) {
  console.log('[GLB] Inicializando escena con URL:', modelUrl);
  
  // Crear escena y renderer para pantalla completa
  const scene = new THREE.Scene();
  
  const renderer = new THREE.WebGLRenderer({ 
    antialias: true, 
    alpha: true 
  });
  
  // Configurar para ocupar todo el viewport
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.setPixelRatio(window.devicePixelRatio);
  renderer.setClearColor(0x000000, 0);
  container.appendChild(renderer.domElement);
  
  // Cámara por defecto
  const camera = new THREE.PerspectiveCamera(
    75,
    window.innerWidth / window.innerHeight,
    0.1,
    1000
  );
  
  // Configurar controles
  const controls = new OrbitControls(camera, renderer.domElement);
  controls.enableDamping = true;
  controls.dampingFactor = 0.05;
  controls.screenSpacePanning = false;
  controls.minDistance = 1;
  controls.maxDistance = 500;
  
  // Añadir luces mejoradas
  const ambientLight = new THREE.AmbientLight(0x404040, 0.8);
  scene.add(ambientLight);
  
  const directionalLight = new THREE.DirectionalLight(0xffffff, 1.0);
  directionalLight.position.set(10, 10, 10);
  directionalLight.castShadow = true;
  scene.add(directionalLight);
  
  const directionalLight2 = new THREE.DirectionalLight(0xffffff, 0.5);
  directionalLight2.position.set(-10, -10, -10);
  scene.add(directionalLight2);
  
  // Variables para animaciones
  let mixer = null;
  let clock = new THREE.Clock();
  let animations = [];
  let model = null;
  
  // Cargar modelo GLB
  const loader = new GLTFLoader();
  
  return new Promise((resolve, reject) => {
    loader.load(
      modelUrl,
      (gltf) => {
        console.log('[GLB] ✅ Modelo cargado exitosamente');
        console.log('[GLB] 🎬 Animaciones encontradas:', gltf.animations?.length || 0);
        console.log('[GLB] 📹 Cámaras encontradas:', gltf.cameras?.length || 0);
        
        // Agregar el modelo a la escena
        model = gltf.scene;
        scene.add(model);
        
        // ESCALADO x8: Hacer el modelo 8 veces más grande
        console.log('[GLB] 📏 Escalando modelo x8...');
        model.scale.set(20, 20, 20);
        
        // Centrar el modelo después del escalado
        const box = new THREE.Box3().setFromObject(model);
        const center = box.getCenter(new THREE.Vector3());
        const size = box.getSize(new THREE.Vector3());
        
        console.log('[GLB] 📦 Tamaño del modelo escalado:', size);
        console.log('[GLB] 📍 Centro del modelo:', center);
        
        // Centrar el modelo en el origen
        model.position.x = -center.x;
        model.position.y = -center.y;
        model.position.z = -center.z;
        
        // Ajustar cámara basada en el nuevo tamaño
        const maxDim = Math.max(size.x, size.y, size.z);
        camera.position.set(0, maxDim * 0.5, maxDim * 1.5);
        camera.lookAt(0, 0, 0);
        controls.target.set(0, 0, 0);
        controls.update();
        
        console.log('[GLB] 📷 Posición cámara ajustada:', camera.position);
        
        // Configurar animaciones - IMPORTANTE: intentar diferentes targets
        if (gltf.animations && gltf.animations.length > 0) {
          console.log('[GLB] 🎭 Configurando AnimationMixer...');
          
          // Probar con diferentes targets para el mixer
          const targets = [gltf.scene, model];
          let mixerCreated = false;
          
          for (let target of targets) {
            if (!mixerCreated) {
              try {
                mixer = new THREE.AnimationMixer(target);
                
                // Intentar agregar todas las animaciones
                gltf.animations.forEach((clip, index) => {
                  console.log(`[GLB] 🎬 Procesando animación ${index}: "${clip.name}" (duración: ${clip.duration.toFixed(2)}s)`);
                  
                  try {
                    const action = mixer.clipAction(clip);
                    action.play();
                    animations.push(action);
                    console.log(`[GLB] ✅ Animación ${index} activada correctamente`);
                  } catch (clipError) {
                    console.warn(`[GLB] ⚠️ Error con animación ${index}:`, clipError);
                  }
                });
                
                if (animations.length > 0) {
                  mixerCreated = true;
                  console.log(`[GLB] 🎉 AnimationMixer creado con ${animations.length} animaciones activas`);
                }
              } catch (mixerError) {
                console.warn('[GLB] ⚠️ Error creando mixer con target:', target.constructor.name, mixerError);
              }
            }
          }
          
          if (!mixerCreated) {
            console.error('[GLB] ❌ No se pudo crear AnimationMixer con ningún target');
          }
        } else {
          console.log('[GLB] ℹ️ No se encontraron animaciones en el modelo GLB');
        }
        
        // Función de animación principal
        function animate() {
          requestAnimationFrame(animate);
          
          const delta = clock.getDelta();
          
          // Actualizar controles
          controls.update();
          
          // Actualizar animaciones si existen
          if (mixer && animations.length > 0) {
            mixer.update(delta);
          }
          
          renderer.render(scene, camera);
        }
        
        animate();
        
        // Manejar redimensionamiento
        function handleResize() {
          const width = window.innerWidth;
          const height = window.innerHeight;
          
          camera.aspect = width / height;
          camera.updateProjectionMatrix();
          renderer.setSize(width, height);
          renderer.setPixelRatio(window.devicePixelRatio);
        }
        
        window.addEventListener('resize', handleResize);
        
        resolve({
          scene,
          camera,
          renderer,
          controls,
          mixer,
          animations,
          model,
          dispose: () => {
            window.removeEventListener('resize', handleResize);
            controls.dispose();
            if (mixer) mixer.stopAllAction();
            renderer.dispose();
            if (container.contains(renderer.domElement)) {
              container.removeChild(renderer.domElement);
            }
          }
        });
      },
      (progress) => {
        const percent = (progress.loaded / progress.total * 100).toFixed(1);
        console.log(`[GLB] 📂 Progreso de carga: ${percent}%`);
      },
      (error) => {
        console.error('[GLB] ❌ Error al cargar modelo:', error);
        reject(error);
      }
    );
  });
}
