import * as THREE from 'three';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import './style.css';

gsap.registerPlugin(ScrollTrigger);

// Escena ligera: una icosfera de baja densidad, su wireframe y algunos nodos.
const canvas = document.querySelector('#webgl');
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(34, innerWidth / innerHeight, 0.1, 100);
camera.position.set(0, 0, 8.4);
const renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true, powerPreference: 'low-power' });
renderer.setPixelRatio(Math.min(devicePixelRatio, 1.6));
renderer.setSize(innerWidth, innerHeight);
renderer.outputColorSpace = THREE.SRGBColorSpace;
renderer.toneMapping = THREE.ACESFilmicToneMapping;

scene.add(new THREE.AmbientLight(0x8890ff, 1.2));
const keyLight = new THREE.PointLight(0x7377ff, 20, 18); keyLight.position.set(3, 2, 5); scene.add(keyLight);
const cyanLight = new THREE.PointLight(0x42dcff, 13, 16); cyanLight.position.set(-4, -2, 3); scene.add(cyanLight);
const rimLight = new THREE.DirectionalLight(0xffd8fd, 1.4); rimLight.position.set(-2, 4, -3); scene.add(rimLight);

const orb = new THREE.Group(); scene.add(orb);
const geometry = new THREE.IcosahedronGeometry(1.48, 4);
// Desplaza sutilmente los vértices con ruido trigonométrico para dar una forma viva.
const pos = geometry.attributes.position;
for (let i = 0; i < pos.count; i++) {
  const x = pos.getX(i), y = pos.getY(i), z = pos.getZ(i);
  const bump = 1 + 0.045 * Math.sin(x * 4.1 + y * 2.7) * Math.cos(z * 3.5 - y * 2.2);
  pos.setXYZ(i, x * bump, y * bump, z * bump);
}
geometry.computeVertexNormals();
const core = new THREE.Mesh(geometry, new THREE.MeshPhysicalMaterial({ color: 0x5c63bd, metalness: 0.63, roughness: 0.27, clearcoat: 0.95, clearcoatRoughness: 0.18, emissive: 0x151849, emissiveIntensity: 0.65 }));
orb.add(core);
const wire = new THREE.Mesh(geometry, new THREE.MeshBasicMaterial({ color: 0xaeb3ff, wireframe: true, transparent: true, opacity: 0.12 })); wire.scale.setScalar(1.004); orb.add(wire);
const halo = new THREE.Mesh(new THREE.TorusGeometry(1.95, 0.006, 6, 180), new THREE.MeshBasicMaterial({ color: 0x888bff, transparent: true, opacity: 0.42 })); halo.rotation.set(1.1, 0.2, -0.25); orb.add(halo);
const halo2 = new THREE.Mesh(new THREE.TorusGeometry(2.12, 0.004, 6, 180), new THREE.MeshBasicMaterial({ color: 0x54dffc, transparent: true, opacity: 0.25 })); halo2.rotation.set(0.9, 0.8, 0.6); orb.add(halo2);

// Pequeños nodos ligados visualmente al objeto, sin líneas costosas.
const nodeGeometry = new THREE.SphereGeometry(0.025, 8, 8);
const nodeMaterial = new THREE.MeshBasicMaterial({ color: 0x9fefff });
for (let i = 0; i < 24; i++) {
  const phi = Math.acos(-1 + (2 * i) / 24), theta = Math.sqrt(24 * Math.PI) * phi;
  const node = new THREE.Mesh(nodeGeometry, nodeMaterial);
  node.position.set(1.53 * Math.cos(theta) * Math.sin(phi), 1.53 * Math.sin(theta) * Math.sin(phi), 1.53 * Math.cos(phi));
  orb.add(node);
}

let pointer = { x: 0, y: 0 };
let targetPointer = { x: 0, y: 0 };
window.addEventListener('pointermove', (e) => { targetPointer.x = (e.clientX / innerWidth - .5) * 2; targetPointer.y = (e.clientY / innerHeight - .5) * 2; }, { passive: true });

// Responsive: adapta cámara y desplaza el objeto menos en pantallas estrechas.
function resize() {
  const mobile = innerWidth < 760;
  camera.aspect = innerWidth / innerHeight;
  camera.position.z = mobile ? 9.8 : 8.4;
  camera.updateProjectionMatrix();
  renderer.setSize(innerWidth, innerHeight);
  renderer.setPixelRatio(Math.min(devicePixelRatio, mobile ? 1.25 : 1.6));
  ScrollTrigger.refresh();
}
window.addEventListener('resize', resize, { passive: true });

const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)').matches;
if (!reducedMotion) {
  // Los estados por sección se interpolan con scrub: la escena avanza/retrocede con el scroll.
  const timeline = gsap.timeline({ scrollTrigger: { trigger: 'main', start: 'top top', end: 'bottom bottom', scrub: 1.15 } });
  timeline.to(orb.position, { x: 1.75, y: -0.1, duration: 1 }, 0.3)
    .to(orb.scale, { x: 0.8, y: 0.8, z: 0.8, duration: 1 }, 0.3)
    .to(core.material.color, { r: 0.2, g: 0.62, b: 0.72, duration: 1 }, 1.1)
    .to(orb.rotation, { y: Math.PI * 1.3, x: 0.5, duration: 1 }, 1.15)
    .to(orb.position, { x: -1.65, y: 0.05, duration: 1 }, 1.75)
    .to(core.material.color, { r: 0.5, g: 0.31, b: 0.72, duration: 1 }, 1.8)
    .to(orb.scale, { x: 0.58, y: 0.58, z: 0.58, duration: 1 }, 2.55)
    .to(orb.position, { x: 1.15, y: -0.45, duration: 1 }, 2.65)
    .to(core.material, { opacity: 0.08, transparent: true, duration: 1 }, 3.2)
    .to(wire.material, { opacity: 0.02, duration: 1 }, 3.2)
    .to(orb.scale, { x: 0.2, y: 0.2, z: 0.2, duration: 1 }, 3.2);
} else {
  orb.position.set(1.7, 0, 0);
  orb.scale.setScalar(0.72);
}

// Render only while visible; cap DPR and lerp pointer motion to keep GPU work modest.
let visible = true;
new IntersectionObserver(([entry]) => { visible = entry.isIntersecting; }).observe(canvas);
const clock = new THREE.Clock();
function render() {
  requestAnimationFrame(render);
  if (!visible) return;
  const t = clock.getElapsedTime();
  pointer.x += (targetPointer.x - pointer.x) * 0.025;
  pointer.y += (targetPointer.y - pointer.y) * 0.025;
  if (!reducedMotion) { orb.rotation.y += 0.0015; orb.rotation.x += (pointer.y * 0.035 - orb.rotation.x) * 0.01; }
  keyLight.position.x = 3 + pointer.x * 1.3;
  keyLight.position.y = 2 - pointer.y * 1.1;
  halo.rotation.z += 0.0008;
  halo2.rotation.x += 0.0005;
  core.material.emissiveIntensity = 0.58 + Math.sin(t * 0.8) * 0.08;
  renderer.render(scene, camera);
}
render();

// Formulario de demo: valida los datos y abre el cliente de correo del visitante.
document.querySelector('#contact-form').addEventListener('submit', (event) => {
  event.preventDefault();
  const data = new FormData(event.currentTarget);
  const subject = encodeURIComponent(`Consulta web de ${data.get('name')}`);
  const body = encodeURIComponent(`Nombre: ${data.get('name')}\nEmail: ${data.get('email')}\n\nProyecto:\n${data.get('message')}`);
  document.querySelector('#form-note').textContent = 'Abriendo tu aplicación de correo…';
  window.location.href = `mailto:hola@nfdigital.studio?subject=${subject}&body=${body}`;
});
