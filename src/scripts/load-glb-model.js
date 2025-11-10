import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';

/**
 * Inicializa la escena 3D con el modelo GLB
 * @param {HTMLElement} container - Contenedor donde se renderizará la escena
 * @param {string} modelUrl - URL completa del modelo GLB (debe incluir BASE_URL si es necesario)
 * @returns {Promise<Object>} - Objeto con la escena, cámara, renderer, controles, etc.
 */
export async function initGLBScene(container, modelUrl) {
  console.log('[GLB] 🚀 Inicializando escena 3D');
  console.log('[GLB] 📂 URL del modelo:', modelUrl);
  console.log('[GLB] 🌐 Location:', window.location.href);
  
  // Crear escena
  const scene = new THREE.Scene();
  
  // Crear renderer
  const renderer = new THREE.WebGLRenderer({
    antialias: true,
    alpha: true
  });
  
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.setPixelRatio(window.devicePixelRatio);
  renderer.setClearColor(0x000000, 0); // Transparente
  container.appendChild(renderer.domElement);
  
  console.log('[GLB] ✅ Renderer creado');
  
  // Crear cámara
  const camera = new THREE.PerspectiveCamera(
    75,
    window.innerWidth / window.innerHeight,
    0.1,
    1000
  );
  
  // Crear controles
  const controls = new OrbitControls(camera, renderer.domElement);
  controls.enableDamping = true;
  controls.dampingFactor = 0.05;
  controls.minDistance = 1;
  controls.maxDistance = 500;
  
  console.log('[GLB] ✅ Controles configurados');
  
  // Iluminación
  const ambientLight = new THREE.AmbientLight(0xffffff, 0.8);
  scene.add(ambientLight);
  
  const directionalLight1 = new THREE.DirectionalLight(0xffffff, 1.0);
  directionalLight1.position.set(10, 10, 10);
  scene.add(directionalLight1);
  
  const directionalLight2 = new THREE.DirectionalLight(0xffffff, 0.5);
  directionalLight2.position.set(-10, -10, -10);
  scene.add(directionalLight2);
  
  console.log('[GLB] ✅ Luces configuradas');
  
  // Cargar modelo GLB
  const loader = new GLTFLoader();
  
  return new Promise((resolve, reject) => {
    loader.load(
      modelUrl,
      // onLoad
      (gltf) => {
        console.log('[GLB] ✅✅✅ Modelo cargado exitosamente');
        console.log('[GLB] 📊 Elementos en escena:', gltf.scene.children.length);
        console.log('[GLB] 🎬 Animaciones:', gltf.animations.length);
        
        const model = gltf.scene;
        scene.add(model);
        
        // Escalar el modelo
        model.scale.set(20, 20, 20);
        
        // Centrar el modelo
        const box = new THREE.Box3().setFromObject(model);
        const center = box.getCenter(new THREE.Vector3());
        const size = box.getSize(new THREE.Vector3());
        
        model.position.x = -center.x;
        model.position.y = -center.y;
        model.position.z = -center.z;
        
        // Posicionar cámara
        const maxDim = Math.max(size.x, size.y, size.z);
        camera.position.set(0, maxDim * 0.5, maxDim * 1.5);
        camera.lookAt(0, 0, 0);
        
        console.log('[GLB] 📏 Tamaño del modelo:', {
          x: size.x.toFixed(2),
          y: size.y.toFixed(2),
          z: size.z.toFixed(2)
        });
        
        console.log('[GLB] 📹 Cámara en:', {
          x: camera.position.x.toFixed(2),
          y: camera.position.y.toFixed(2),
          z: camera.position.z.toFixed(2)
        });
        
        // Configurar animaciones si existen
        const mixer = gltf.animations.length > 0
          ? new THREE.AnimationMixer(model)
          : null;
        
        if (mixer) {
          gltf.animations.forEach((clip) => {
            const action = mixer.clipAction(clip);
            action.play();
          });
          console.log('[GLB] 🎬 Animaciones iniciadas');
        }
        
        // Loop de animación
        const clock = new THREE.Clock();
        
        function animate() {
          requestAnimationFrame(animate);
          
          const delta = clock.getDelta();
          if (mixer) mixer.update(delta);
          
          controls.update();
          renderer.render(scene, camera);
        }
        
        animate();
        console.log('[GLB] ✅ Loop de animación iniciado');
        
        // Manejo de resize
        window.addEventListener('resize', () => {
          camera.aspect = window.innerWidth / window.innerHeight;
          camera.updateProjectionMatrix();
          renderer.setSize(window.innerWidth, window.innerHeight);
        });
        
        // Resolver la promesa con todos los objetos
        resolve({
          scene,
          camera,
          renderer,
          controls,
          mixer,
          model,
          animations: gltf.animations,
          dispose: () => {
            renderer.dispose();
            controls.dispose();
            if (mixer) mixer.stopAllAction();
          }
        });
      },
      // onProgress
      (xhr) => {
        if (xhr.lengthComputable) {
          const percentComplete = (xhr.loaded / xhr.total * 100).toFixed(2);
          console.log(`[GLB] 📥 Cargando: ${percentComplete}%`);
        }
      },
      // onError
      (error) => {
        console.error('[GLB] ❌❌❌ Error al cargar modelo');
        console.error('[GLB] Error:', error);
        console.error('[GLB] Tipo:', error.constructor.name);
        console.error('[GLB] Mensaje:', error.message);
        console.error('[GLB] URL intentada:', modelUrl);
        reject(error);
      }
    );
  });
}
