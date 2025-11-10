import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';

export async function initGLBScene(container, modelUrl) {
  console.log('[GLB] Inicializando escena con URL:', modelUrl);

  const scene = new THREE.Scene();

  const renderer = new THREE.WebGLRenderer({
    antialias: true,
    alpha: true
  });
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.setPixelRatio(window.devicePixelRatio);
  renderer.setClearColor(0x000000, 0);
  container.appendChild(renderer.domElement);

  const camera = new THREE.PerspectiveCamera(
    75,
    window.innerWidth / window.innerHeight,
    0.1,
    1000
  );

  const controls = new OrbitControls(camera, renderer.domElement);
  controls.enableDamping = true;
  controls.dampingFactor = 0.05;
  controls.minDistance = 1;
  controls.maxDistance = 500;

  scene.add(new THREE.AmbientLight(0x404040, 0.8));

  const directionalLight = new THREE.DirectionalLight(0xffffff, 1.0);
  directionalLight.position.set(10, 10, 10);
  scene.add(directionalLight);

  const directionalLight2 = new THREE.DirectionalLight(0xffffff, 0.5);
  directionalLight2.position.set(-10, -10, -10);
  scene.add(directionalLight2);

  const loader = new GLTFLoader();

  return new Promise((resolve, reject) => {
    loader.load(
      modelUrl,
      (gltf) => {
        console.log('[GLB] ✅ Modelo cargado correctamente');

        const model = gltf.scene;
        scene.add(model);

        // Escalar y centrar
        model.scale.set(20, 20, 20);
        const box = new THREE.Box3().setFromObject(model);
        const center = box.getCenter(new THREE.Vector3());
        model.position.x = -center.x;
        model.position.y = -center.y;
        model.position.z = -center.z;

        const size = box.getSize(new THREE.Vector3());
        const maxDim = Math.max(size.x, size.y, size.z);
        camera.position.set(0, maxDim * 0.5, maxDim * 1.5);
        camera.lookAt(0, 0, 0);

        const mixer = gltf.animations.length
          ? new THREE.AnimationMixer(model)
          : null;

        if (mixer) {
          gltf.animations.forEach((clip) => mixer.clipAction(clip).play());
        }

        const clock = new THREE.Clock();
        function animate() {
          requestAnimationFrame(animate);
          const delta = clock.getDelta();
          if (mixer) mixer.update(delta);
          controls.update();
          renderer.render(scene, camera);
        }
        animate();

        window.addEventListener('resize', () => {
          camera.aspect = window.innerWidth / window.innerHeight;
          camera.updateProjectionMatrix();
          renderer.setSize(window.innerWidth, window.innerHeight);
        });

        resolve({ scene, camera, renderer, controls, mixer, model });
      },
      undefined,
      (error) => {
        console.error('[GLB] ❌ Error al cargar modelo:', error);
        reject(error);
      }
    );
  });
}
