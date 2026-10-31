'use client';

import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js';
import { HandState, Gender, CharacterStyle, DifficultyLevel } from '@/lib/types';
import { sound } from '@/lib/sound';

interface ThreeGameCanvasProps {
  hands: HandState[];
  selectedHandId: number | null;
  onHandClick: (handId: number) => void;
  selectedSkinId: string;
  selectedJewelId: string;
  selectedArenaId: string;
  selectedPoseId: string;
  cameraView: 'front' | 'top' | 'cinematic';
  isHidingPhase: boolean;
  highlightedHandId?: number | null;
  // Character & Anime props
  opponentGender?: Gender;
  userGender?: Gender;
  characterStyle?: CharacterStyle;
  difficulty?: DifficultyLevel;
  isShuffling?: boolean;
  characterEmotion?: 'neutral' | 'bluff' | 'shock' | 'triumph';
  gazeDirection?: 'left' | 'right' | 'center';
}

interface Hand3DNode {
  id: number;
  group: THREE.Group;
  palmMesh: THREE.Mesh;
  fingersGroup: THREE.Group;
  thumbMesh: THREE.Mesh;
  ringMesh?: THREE.Mesh;
  jewelGroup?: THREE.Group;
  targetY: number;
  targetRotX: number;
  targetOpen: number; // 0 = closed fist, 1 = fully open flat palm
  currentOpen: number;
  baseX: number;
  currentX: number;
}

export default function ThreeGameCanvas({
  hands,
  selectedHandId,
  onHandClick,
  selectedSkinId,
  selectedJewelId,
  selectedArenaId,
  cameraView,
  isHidingPhase,
  highlightedHandId,
  opponentGender = 'female',
  userGender = 'male',
  characterStyle = 'anime',
  difficulty = 'pro',
  isShuffling = false,
  characterEmotion = 'neutral',
  gazeDirection = 'center',
}: ThreeGameCanvasProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const handNodesRef = useRef<Map<number, Hand3DNode>>(new Map());
  const avatarGroupRef = useRef<THREE.Group | null>(null);
  const raycasterRef = useRef(new THREE.Raycaster());
  const mouseRef = useRef(new THREE.Vector2());
  const animationFrameIdRef = useRef<number>(0);

  // Avatar sub-references for animation
  const avatarRigRef = useRef<{
    head: THREE.Group;
    torso: THREE.Group;
    leftEye: THREE.Mesh;
    rightEye: THREE.Mesh;
    leftEyelid: THREE.Mesh;
    rightEyelid: THREE.Mesh;
    leftEyebrow: THREE.Mesh;
    rightEyebrow: THREE.Mesh;
    mouth: THREE.Mesh;
    leftArm: THREE.Group;
    rightArm: THREE.Group;
  } | null>(null);

  // Shuffle animation state
  const shuffleStateRef = useRef({
    active: false,
    timer: 0,
    duration: 2.2,
    swaps: 4,
    lastSwapIndex: -1,
  });

  // Keep references to current props for the animation loop
  const propsRef = useRef({
    hands,
    selectedHandId,
    onHandClick,
    selectedSkinId,
    selectedJewelId,
    selectedArenaId,
    cameraView,
    isHidingPhase,
    highlightedHandId,
    opponentGender,
    userGender,
    characterStyle,
    difficulty,
    isShuffling,
    characterEmotion,
    gazeDirection,
  });

  useEffect(() => {
    propsRef.current = {
      hands,
      selectedHandId,
      onHandClick,
      selectedSkinId,
      selectedJewelId,
      selectedArenaId,
      cameraView,
      isHidingPhase,
      highlightedHandId,
      opponentGender,
      userGender,
      characterStyle,
      difficulty,
      isShuffling,
      characterEmotion,
      gazeDirection,
    };
  }, [
    hands,
    selectedHandId,
    onHandClick,
    selectedSkinId,
    selectedJewelId,
    selectedArenaId,
    cameraView,
    isHidingPhase,
    highlightedHandId,
    opponentGender,
    userGender,
    characterStyle,
    difficulty,
    isShuffling,
    characterEmotion,
    gazeDirection,
  ]);

  // Trigger shuffle animation cycle when isShuffling changes
  useEffect(() => {
    if (isShuffling) {
      const swaps = difficulty === 'grandmaster' ? 6 : difficulty === 'casual' ? 2 : 4;
      const duration = difficulty === 'grandmaster' ? 2.8 : difficulty === 'casual' ? 1.6 : 2.2;
      shuffleStateRef.current = {
        active: true,
        timer: 0,
        duration,
        swaps,
        lastSwapIndex: -1,
      };
      sound.playSleightClasp();
    } else {
      shuffleStateRef.current.active = false;
    }
  }, [isShuffling, difficulty]);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    // Detect software WebGL guard
    const isSoftwareGl = (() => {
      const gl = document.createElement('canvas').getContext('webgl2');
      if (!gl) return true;
      const ext = gl.getExtension('WEBGL_debug_renderer_info');
      const param = ext ? ext.UNMASKED_RENDERER_WEBGL : gl.RENDERER;
      const gpu = String(gl.getParameter(param));
      gl.getExtension('WEBGL_lose_context')?.loseContext();
      return /SwiftShader|llvmpipe|softpipe|Software|Basic Render/i.test(gpu);
    })();

    const width = container.clientWidth || 800;
    const height = container.clientHeight || 500;

    // 1. Initialize Renderer
    const renderer = new THREE.WebGLRenderer({
      antialias: !isSoftwareGl,
      powerPreference: 'high-performance',
      alpha: true,
    });
    renderer.setSize(width, height);
    renderer.setPixelRatio(isSoftwareGl ? 1 : Math.min(window.devicePixelRatio, 2));
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.15;
    renderer.shadowMap.enabled = !isSoftwareGl;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;

    container.innerHTML = '';
    container.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    // 2. Scene setup
    const scene = new THREE.Scene();
    sceneRef.current = scene;

    // Studio Environment map using PMREM
    const pmremGenerator = new THREE.PMREMGenerator(renderer);
    scene.environment = pmremGenerator.fromScene(new RoomEnvironment(), 0.04).texture;
    pmremGenerator.dispose();

    // 3. Camera setup
    const camera = new THREE.PerspectiveCamera(40, width / height, 0.1, 100);
    camera.position.set(0, 3.8, 6.2);
    camera.lookAt(0, 0.4, 0);
    cameraRef.current = camera;

    // 4. Lighting rig
    const keyLight = new THREE.DirectionalLight(0xffedd5, 1.4);
    keyLight.position.set(3, 7, 5);
    keyLight.castShadow = !isSoftwareGl;
    if (keyLight.shadow) {
      keyLight.shadow.mapSize.width = 1024;
      keyLight.shadow.mapSize.height = 1024;
      keyLight.shadow.bias = -0.0005;
      keyLight.shadow.normalBias = 0.02;
    }
    scene.add(keyLight);

    const fillLight = new THREE.HemisphereLight(0x7dd3fc, 0x1e293b, 0.7);
    scene.add(fillLight);

    const rimLight = new THREE.DirectionalLight(0xf59e0b, 1.0);
    rimLight.position.set(-4, 5, -4);
    scene.add(rimLight);

    // Front soft avatar keylight
    const avatarSpot = new THREE.DirectionalLight(0xffeedd, 0.85);
    avatarSpot.position.set(0, 3, 2);
    avatarSpot.target.position.set(0, 1.4, -1.3);
    scene.add(avatarSpot);
    scene.add(avatarSpot.target);

    // 5. Casino Poker Table
    const tableGroup = new THREE.Group();
    scene.add(tableGroup);

    // Table Felt Top
    const tableGeo = new THREE.CylinderGeometry(2.8, 2.8, 0.16, 64);
    const tableMat = new THREE.MeshStandardMaterial({
      color: 0x064e3b, // VIP green
      roughness: 0.82,
      metalness: 0.05,
    });
    const tableFelt = new THREE.Mesh(tableGeo, tableMat);
    tableFelt.receiveShadow = !isSoftwareGl;
    tableFelt.position.y = -0.08;
    tableGroup.add(tableFelt);

    // Mahogany Padded Armrest Rail
    const railGeo = new THREE.TorusGeometry(2.85, 0.14, 20, 64);
    const railMat = new THREE.MeshStandardMaterial({
      color: 0x24140e,
      roughness: 0.35,
      metalness: 0.15,
    });
    const rail = new THREE.Mesh(railGeo, railMat);
    rail.rotation.x = Math.PI / 2;
    rail.position.y = -0.01;
    tableGroup.add(rail);

    // Center Gold Inlay Ring
    const centerRingGeo = new THREE.RingGeometry(1.4, 1.48, 64);
    const centerRingMat = new THREE.MeshStandardMaterial({
      color: 0xf59e0b,
      metalness: 0.95,
      roughness: 0.18,
      side: THREE.DoubleSide,
    });
    const centerRing = new THREE.Mesh(centerRingGeo, centerRingMat);
    centerRing.rotation.x = -Math.PI / 2;
    centerRing.position.y = 0.005;
    tableGroup.add(centerRing);

    // Table pedestal stand
    const tableLegGeo = new THREE.CylinderGeometry(0.8, 1.2, 2.5, 32);
    const tableLegMat = new THREE.MeshStandardMaterial({
      color: 0x0f172a,
      roughness: 0.4,
      metalness: 0.6,
    });
    const tableLeg = new THREE.Mesh(tableLegGeo, tableLegMat);
    tableLeg.position.y = -1.35;
    tableGroup.add(tableLeg);

    // 6. Click & Pointer interaction handler
    const handleClick = (e: MouseEvent) => {
      const rect = renderer.domElement.getBoundingClientRect();
      mouseRef.current.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      mouseRef.current.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;

      raycasterRef.current.setFromCamera(mouseRef.current, camera);
      const interactiveMeshes: THREE.Object3D[] = [];
      handNodesRef.current.forEach((node) => {
        interactiveMeshes.push(node.group);
      });

      const intersects = raycasterRef.current.intersectObjects(interactiveMeshes, true);
      if (intersects.length > 0) {
        let obj: THREE.Object3D | null = intersects[0].object;
        while (obj && typeof obj.userData?.handId !== 'number' && obj.parent) {
          obj = obj.parent;
        }
        if (obj && typeof obj.userData?.handId === 'number') {
          propsRef.current.onHandClick(obj.userData.handId);
        }
      }
    };

    const handlePointerMove = (e: MouseEvent) => {
      const rect = renderer.domElement.getBoundingClientRect();
      mouseRef.current.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      mouseRef.current.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;

      raycasterRef.current.setFromCamera(mouseRef.current, camera);
      const interactiveMeshes: THREE.Object3D[] = [];
      handNodesRef.current.forEach((node) => {
        interactiveMeshes.push(node.group);
      });

      const intersects = raycasterRef.current.intersectObjects(interactiveMeshes, true);
      renderer.domElement.style.cursor = intersects.length > 0 ? 'pointer' : 'default';
    };

    const domElem = renderer.domElement;
    domElem.addEventListener('click', handleClick);
    domElem.addEventListener('pointermove', handlePointerMove);

    // Handle Resize
    const handleResize = () => {
      if (!container || !renderer || !camera) return;
      const w = container.clientWidth;
      const h = container.clientHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };
    window.addEventListener('resize', handleResize);

    // Soft Radial Shadow Texture for realistic table AO
    const shadowCanvas = document.createElement('canvas');
    shadowCanvas.width = 128;
    shadowCanvas.height = 128;
    const shadowCtx = shadowCanvas.getContext('2d')!;
    const shadowGrad = shadowCtx.createRadialGradient(64, 64, 10, 64, 64, 64);
    shadowGrad.addColorStop(0, 'rgba(0, 0, 0, 0.68)');
    shadowGrad.addColorStop(0.4, 'rgba(0, 0, 0, 0.28)');
    shadowGrad.addColorStop(1, 'rgba(0, 0, 0, 0)');
    shadowCtx.fillStyle = shadowGrad;
    shadowCtx.fillRect(0, 0, 128, 128);
    const softShadowTexture = new THREE.CanvasTexture(shadowCanvas);

    // 7. Jewel Builder
    function createProceduralJewel(jewelType: string): THREE.Group {
      const jewelGroup = new THREE.Group();
      if (jewelType === 'ancient_coin') {
        const coinGeo = new THREE.CylinderGeometry(0.18, 0.18, 0.04, 32);
        const coinMat = new THREE.MeshStandardMaterial({
          color: 0xfbbf24,
          metalness: 0.95,
          roughness: 0.22,
        });
        const coinMesh = new THREE.Mesh(coinGeo, coinMat);
        coinMesh.rotation.x = Math.PI / 4;
        jewelGroup.add(coinMesh);
      } else if (jewelType === 'cyber_rose') {
        const centerGeo = new THREE.SphereGeometry(0.1, 16, 16);
        const centerMat = new THREE.MeshStandardMaterial({
          color: 0xec4899,
          emissive: 0xdb2777,
          emissiveIntensity: 0.9,
          roughness: 0.3,
        });
        const center = new THREE.Mesh(centerGeo, centerMat);
        jewelGroup.add(center);

        for (let p = 0; p < 6; p++) {
          const petalGeo = new THREE.CylinderGeometry(0.06, 0.14, 0.02, 12);
          const petalMat = new THREE.MeshStandardMaterial({
            color: 0xf472b6,
            roughness: 0.4,
          });
          const petal = new THREE.Mesh(petalGeo, petalMat);
          petal.position.x = Math.cos((p * Math.PI) / 3) * 0.12;
          petal.position.z = Math.sin((p * Math.PI) / 3) * 0.12;
          petal.rotation.y = (p * Math.PI) / 3;
          jewelGroup.add(petal);
        }
      } else if (jewelType === 'quantum_cube') {
        const outerGeo = new THREE.BoxGeometry(0.24, 0.24, 0.24);
        const outerMat = new THREE.MeshStandardMaterial({
          color: 0xa855f7,
          wireframe: true,
          emissive: 0x9333ea,
          emissiveIntensity: 0.8,
        });
        const outer = new THREE.Mesh(outerGeo, outerMat);
        jewelGroup.add(outer);

        const innerGeo = new THREE.SphereGeometry(0.08, 16, 16);
        const innerMat = new THREE.MeshStandardMaterial({
          color: 0x38bdf8,
          emissive: 0x0284c7,
          emissiveIntensity: 1.4,
        });
        const inner = new THREE.Mesh(innerGeo, innerMat);
        jewelGroup.add(inner);
      } else if (jewelType === 'ruby_agate') {
        const rubyGeo = new THREE.DodecahedronGeometry(0.18);
        const rubyMat = new THREE.MeshStandardMaterial({
          color: 0xbe123c,
          emissive: 0x9f1239,
          emissiveIntensity: 0.4,
          roughness: 0.15,
          metalness: 0.2,
        });
        const ruby = new THREE.Mesh(rubyGeo, rubyMat);
        jewelGroup.add(ruby);
      } else {
        // Classic Diamond
        const diamondGeo = new THREE.OctahedronGeometry(0.2, 0);
        const diamondMat = new THREE.MeshPhysicalMaterial({
          color: 0xe0f2fe,
          emissive: 0x38bdf8,
          emissiveIntensity: 0.6,
          roughness: 0.08,
          metalness: 0.1,
          transmission: isSoftwareGl ? 0 : 0.9,
          transparent: true,
          opacity: 0.95,
          ior: 2.4,
        });
        const diamond = new THREE.Mesh(diamondGeo, diamondMat);
        jewelGroup.add(diamond);
      }

      const jewelLight = new THREE.PointLight(0x38bdf8, 1.2, 1.2);
      jewelLight.position.y = 0.1;
      jewelGroup.add(jewelLight);

      return jewelGroup;
    }

    // 8. 3D Character Avatar Across The Table Builder
    function create3DOpponentAvatar(
      gender: Gender,
      style: CharacterStyle
    ): THREE.Group {
      const avatar = new THREE.Group();
      avatar.userData = { isAvatar: true };
      avatar.position.set(0, 0, -1.32);

      const isFemale = gender === 'female';
      const isAnime = style === 'anime';

      // Skin Tone
      const skinColor = isFemale ? 0xfcd5b5 : 0xcb8156;
      const skinMat = new THREE.MeshStandardMaterial({
        color: skinColor,
        roughness: 0.52,
        metalness: 0.03,
      });

      // Clothing Material (Suit / Jacket)
      const suitColor = isFemale ? 0x831843 : 0x0f172a; // Burgundy velvet for female, Navy charcoal for male
      const suitMat = new THREE.MeshStandardMaterial({
        color: suitColor,
        roughness: 0.65,
        metalness: 0.1,
      });

      // Inner Shirt / Top Material
      const shirtMat = new THREE.MeshStandardMaterial({
        color: isFemale ? 0xf8fafc : 0xf1f5f9,
        roughness: 0.5,
      });

      // Torso Group
      const torsoGroup = new THREE.Group();
      torsoGroup.position.set(0, 0.75, 0);

      // Main Torso Cylinder/Chest
      const chestWidth = isFemale ? 0.75 : 0.95;
      const torsoGeo = new THREE.CylinderGeometry(chestWidth * 0.46, chestWidth * 0.38, 0.85, 20);
      const torsoMesh = new THREE.Mesh(torsoGeo, suitMat);
      torsoMesh.castShadow = !isSoftwareGl;
      torsoGroup.add(torsoMesh);

      // Shirt Inlay / Collar V-shape
      const innerVGeo = new THREE.BufferGeometry();
      const vertices = new Float32Array([
        -0.15, 0.42, 0.19,
         0.15, 0.42, 0.19,
         0.0,  0.05, 0.21,
      ]);
      innerVGeo.setAttribute('position', new THREE.BufferAttribute(vertices, 3));
      innerVGeo.computeVertexNormals();
      const innerVMesh = new THREE.Mesh(innerVGeo, shirtMat);
      torsoGroup.add(innerVMesh);

      // Female Gold Choker Necklace or Male Silk Tie
      if (isFemale) {
        const chokerGeo = new THREE.TorusGeometry(0.17, 0.016, 12, 32);
        const goldMat = new THREE.MeshStandardMaterial({ color: 0xf59e0b, metalness: 0.9, roughness: 0.2 });
        const choker = new THREE.Mesh(chokerGeo, goldMat);
        choker.rotation.x = Math.PI / 2;
        choker.position.set(0, 0.44, 0);
        torsoGroup.add(choker);
      } else {
        const tieGeo = new THREE.BoxGeometry(0.06, 0.35, 0.02);
        const tieMat = new THREE.MeshStandardMaterial({ color: 0xb91c1c, roughness: 0.4 });
        const tie = new THREE.Mesh(tieGeo, tieMat);
        tie.position.set(0, 0.2, 0.21);
        torsoGroup.add(tie);
      }

      // Neck
      const neckGeo = new THREE.CylinderGeometry(0.14, 0.16, 0.28, 16);
      const neckMesh = new THREE.Mesh(neckGeo, skinMat);
      neckMesh.position.set(0, 0.52, 0);
      torsoGroup.add(neckMesh);

      // Shoulders
      const shoulderX = isFemale ? 0.44 : 0.54;
      [-shoulderX, shoulderX].forEach((x) => {
        const shGeo = new THREE.SphereGeometry(0.16, 14, 14);
        const sh = new THREE.Mesh(shGeo, suitMat);
        sh.position.set(x, 0.32, 0);
        torsoGroup.add(sh);
      });

      avatar.add(torsoGroup);

      // Arms reaching from shoulders towards the table wrists
      const leftArmGroup = new THREE.Group();
      const rightArmGroup = new THREE.Group();

      const armGeo = new THREE.CylinderGeometry(0.12, 0.15, 0.72, 14);
      const leftUpperArm = new THREE.Mesh(armGeo, suitMat);
      leftUpperArm.position.set(-0.58, 0.65, 0.25);
      leftUpperArm.rotation.x = Math.PI / 4.2;
      leftUpperArm.rotation.z = -0.22;
      leftArmGroup.add(leftUpperArm);

      const rightUpperArm = new THREE.Mesh(armGeo, suitMat);
      rightUpperArm.position.set(0.58, 0.65, 0.25);
      rightUpperArm.rotation.x = Math.PI / 4.2;
      rightUpperArm.rotation.z = 0.22;
      rightArmGroup.add(rightUpperArm);

      avatar.add(leftArmGroup);
      avatar.add(rightArmGroup);

      // Head Group
      const headGroup = new THREE.Group();
      headGroup.position.set(0, 1.48, 0);

      // Head Base Oval
      const headRadius = isFemale ? 0.28 : 0.31;
      const headGeo = new THREE.SphereGeometry(headRadius, 24, 24);
      headGeo.scale(0.92, 1.15, 1.0);
      const headMesh = new THREE.Mesh(headGeo, skinMat);
      headMesh.castShadow = !isSoftwareGl;
      headGroup.add(headMesh);

      // Anime / Human Eyes
      const eyeSpacing = isAnime ? 0.14 : 0.11;
      const eyeSize = isAnime ? 0.075 : 0.048;

      // Eye Whites
      const eyeWhiteGeo = new THREE.SphereGeometry(eyeSize, 16, 16);
      eyeWhiteGeo.scale(1.2, 0.9, 0.4);
      const eyeWhiteMat = new THREE.MeshBasicMaterial({ color: 0xffffff });

      // Anime Irises (Vibrant jewel pupils)
      const irisMat = new THREE.MeshBasicMaterial({
        color: isFemale ? 0xd946ef : 0x0284c7,
      });
      const irisGeo = new THREE.CircleGeometry(eyeSize * 0.65, 16);

      // Pupils
      const pupilMat = new THREE.MeshBasicMaterial({ color: 0x09090b });
      const pupilGeo = new THREE.CircleGeometry(eyeSize * 0.3, 12);

      // Left Eye
      const leftEyeGroup = new THREE.Group();
      leftEyeGroup.position.set(-eyeSpacing, 0.02, headRadius * 0.88);
      const leftWhite = new THREE.Mesh(eyeWhiteGeo, eyeWhiteMat);
      const leftIris = new THREE.Mesh(irisGeo, irisMat);
      leftIris.position.set(0, 0, 0.02);
      const leftPupil = new THREE.Mesh(pupilGeo, pupilMat);
      leftPupil.position.set(0, 0, 0.022);
      leftEyeGroup.add(leftWhite, leftIris, leftPupil);
      headGroup.add(leftEyeGroup);

      // Right Eye
      const rightEyeGroup = new THREE.Group();
      rightEyeGroup.position.set(eyeSpacing, 0.02, headRadius * 0.88);
      const rightWhite = new THREE.Mesh(eyeWhiteGeo, eyeWhiteMat);
      const rightIris = new THREE.Mesh(irisGeo, irisMat);
      rightIris.position.set(0, 0, 0.02);
      const rightPupil = new THREE.Mesh(pupilGeo, pupilMat);
      rightPupil.position.set(0, 0, 0.022);
      rightEyeGroup.add(rightWhite, rightIris, rightPupil);
      headGroup.add(rightEyeGroup);

      // Blinking Eyelids
      const eyelidGeo = new THREE.PlaneGeometry(eyeSize * 2.4, eyeSize * 1.8);
      const eyelidMat = new THREE.MeshStandardMaterial({
        color: skinColor,
        roughness: 0.6,
        side: THREE.DoubleSide,
      });
      const leftEyelid = new THREE.Mesh(eyelidGeo, eyelidMat);
      leftEyelid.position.set(-eyeSpacing, 0.09, headRadius * 0.91);
      leftEyelid.scale.y = 0.05;
      headGroup.add(leftEyelid);

      const rightEyelid = new THREE.Mesh(eyelidGeo, eyelidMat);
      rightEyelid.position.set(eyeSpacing, 0.09, headRadius * 0.91);
      rightEyelid.scale.y = 0.05;
      headGroup.add(rightEyelid);

      // Eyebrows
      const browMat = new THREE.MeshBasicMaterial({ color: isFemale ? 0x581c87 : 0x18181b });
      const browGeo = new THREE.BoxGeometry(eyeSize * 2.0, 0.018, 0.02);

      const leftBrow = new THREE.Mesh(browGeo, browMat);
      leftBrow.position.set(-eyeSpacing, 0.12, headRadius * 0.89);
      leftBrow.rotation.z = 0.1;
      headGroup.add(leftBrow);

      const rightBrow = new THREE.Mesh(browGeo, browMat);
      rightBrow.position.set(eyeSpacing, 0.12, headRadius * 0.89);
      rightBrow.rotation.z = -0.1;
      headGroup.add(rightBrow);

      // Stylized Anime Mouth
      const mouthGeo = new THREE.CylinderGeometry(0.01, 0.01, 0.1, 10);
      const mouthMat = new THREE.MeshBasicMaterial({ color: isFemale ? 0xbe123c : 0x475569 });
      const mouth = new THREE.Mesh(mouthGeo, mouthMat);
      mouth.rotation.z = Math.PI / 2;
      mouth.position.set(0, -0.15, headRadius * 0.86);
      headGroup.add(mouth);

      // 3D Anime / Human Hair
      const hairGroup = new THREE.Group();
      const hairColor = isFemale ? 0x2e1065 : 0x09090b;
      const hairMat = new THREE.MeshStandardMaterial({
        color: hairColor,
        roughness: 0.42,
        metalness: 0.15,
      });

      if (isFemale) {
        // Female Hair: Volumetric crown + side locks + styled bangs
        const crownGeo = new THREE.SphereGeometry(headRadius * 1.08, 18, 18);
        crownGeo.scale(1.05, 1.08, 1.15);
        const crown = new THREE.Mesh(crownGeo, hairMat);
        crown.position.set(0, 0.08, -0.06);
        hairGroup.add(crown);

        // Long side locks
        [-0.32, 0.32].forEach((x) => {
          const lockGeo = new THREE.CylinderGeometry(0.06, 0.03, 0.75, 12);
          const lock = new THREE.Mesh(lockGeo, hairMat);
          lock.position.set(x, -0.22, 0.08);
          lock.rotation.z = (x > 0 ? -1 : 1) * 0.12;
          hairGroup.add(lock);
        });

        // Anime Bangs
        for (let b = -3; b <= 3; b++) {
          const bangGeo = new THREE.ConeGeometry(0.055, 0.22, 8);
          const bang = new THREE.Mesh(bangGeo, hairMat);
          bang.rotation.x = Math.PI * 0.95;
          bang.rotation.z = b * 0.1;
          bang.position.set(b * 0.07, 0.2, headRadius * 0.94);
          hairGroup.add(bang);
        }
      } else {
        // Male Spiky Anime Hair
        const crownGeo = new THREE.SphereGeometry(headRadius * 1.06, 16, 16);
        crownGeo.scale(1.04, 1.05, 1.1);
        const crown = new THREE.Mesh(crownGeo, hairMat);
        crown.position.set(0, 0.07, -0.05);
        hairGroup.add(crown);

        const spikes = [
          { pos: [0, 0.38, 0.08], rot: [0.3, 0, 0], scale: 1.2 },
          { pos: [-0.18, 0.35, 0.05], rot: [0.2, 0, 0.4], scale: 1.0 },
          { pos: [0.18, 0.35, 0.05], rot: [0.2, 0, -0.4], scale: 1.0 },
          { pos: [-0.28, 0.22, 0.1], rot: [0.1, 0, 0.6], scale: 0.9 },
          { pos: [0.28, 0.22, 0.1], rot: [0.1, 0, -0.6], scale: 0.9 },
          { pos: [0, 0.25, headRadius * 0.98], rot: [Math.PI * 0.88, 0, 0], scale: 0.8 },
        ];
        spikes.forEach((s) => {
          const spikeGeo = new THREE.ConeGeometry(0.08 * s.scale, 0.28 * s.scale, 8);
          const spike = new THREE.Mesh(spikeGeo, hairMat);
          spike.position.set(s.pos[0], s.pos[1], s.pos[2]);
          spike.rotation.set(s.rot[0], s.rot[1], s.rot[2]);
          hairGroup.add(spike);
        });
      }

      headGroup.add(hairGroup);
      avatar.add(headGroup);

      avatarRigRef.current = {
        head: headGroup,
        torso: torsoGroup,
        leftEye: leftIris,
        rightEye: rightIris,
        leftEyelid,
        rightEyelid,
        leftEyebrow: leftBrow,
        rightEyebrow: rightBrow,
        mouth,
        leftArm: leftArmGroup,
        rightArm: rightArmGroup,
      };

      scene.add(avatar);
      return avatar;
    }

    avatarGroupRef.current = create3DOpponentAvatar(
      propsRef.current.opponentGender,
      propsRef.current.characterStyle
    );

    // 9. Procedural Hand Builder
    function createProceduralHand(
      handId: number,
      handSide: 'left' | 'right',
      skinType: string,
      hasGol: boolean,
      jewelType: string,
      isFemaleOwner: boolean
    ): Hand3DNode {
      const handGroup = new THREE.Group();
      handGroup.userData = { handId };

      const registerPart = <T extends THREE.Object3D>(part: T): T => {
        part.userData = { handId };
        part.castShadow = !isSoftwareGl;
        part.receiveShadow = !isSoftwareGl;
        return part;
      };

      const isLeft = handSide === 'left';

      let skinColor = isFemaleOwner ? 0xf5cca5 : 0xcb8156;
      let roughness = isFemaleOwner ? 0.38 : 0.48;
      let metalness = 0.02;
      let emissive = 0x000000;
      let emissiveIntensity = 0;

      if (skinType === 'midas_gold') {
        skinColor = 0xffd700;
        roughness = 0.18;
        metalness = 0.96;
      } else if (skinType === 'cyber_mech') {
        skinColor = 0x1e293b;
        roughness = 0.3;
        metalness = 0.85;
        emissive = 0x06b6d4;
        emissiveIntensity = 0.25;
      } else if (skinType === 'gangster_ink') {
        skinColor = 0xb8734a;
        roughness = 0.55;
        metalness = 0.08;
      } else if (skinType === 'noir_velvet') {
        skinColor = 0x1f1f23;
        roughness = 0.9;
        metalness = 0.15;
      }

      const mainMat = new THREE.MeshPhysicalMaterial({
        color: skinColor,
        roughness,
        metalness,
        clearcoat: isSoftwareGl ? 0 : isFemaleOwner ? 0.28 : 0.18,
        clearcoatRoughness: 0.35,
        sheen: isSoftwareGl ? 0 : 0.4,
        sheenColor: new THREE.Color(0xffdfc4),
        emissive,
        emissiveIntensity,
      });

      const nailColor =
        skinType === 'cyber_mech'
          ? 0x38bdf8
          : skinType === 'noir_velvet'
          ? 0x831843
          : skinType === 'midas_gold'
          ? 0xfef08a
          : isFemaleOwner
          ? 0xbe123c
          : 0xf5d0be;

      const nailMat = new THREE.MeshStandardMaterial({
        color: nailColor,
        roughness: isFemaleOwner ? 0.08 : 0.2,
        metalness: isFemaleOwner ? 0.15 : skinType === 'cyber_mech' ? 0.7 : 0.08,
      });

      const scaleF = isFemaleOwner ? 0.88 : 1.0;

      // 1. Palm Main Body
      const palmGeo = new THREE.BoxGeometry(0.52 * scaleF, 0.25 * scaleF, 0.52 * scaleF);
      const palmMesh = registerPart(new THREE.Mesh(palmGeo, mainMat));
      palmMesh.position.set(0, 0.13 * scaleF, 0);
      handGroup.add(palmMesh);

      const thenarGeo = new THREE.SphereGeometry(0.12 * scaleF, 16, 16);
      thenarGeo.scale(1.3, 0.9, 1.4);
      const thenarMesh = registerPart(new THREE.Mesh(thenarGeo, mainMat));
      thenarMesh.position.set(isLeft ? 0.2 * scaleF : -0.2 * scaleF, 0.11 * scaleF, 0.04);
      handGroup.add(thenarMesh);

      const hypoGeo = new THREE.SphereGeometry(0.1 * scaleF, 14, 14);
      hypoGeo.scale(0.9, 0.8, 1.5);
      const hypoMesh = registerPart(new THREE.Mesh(hypoGeo, mainMat));
      hypoMesh.position.set(isLeft ? -0.22 * scaleF : 0.22 * scaleF, 0.1 * scaleF, -0.04);
      handGroup.add(hypoMesh);

      // 2. Wrist & Cuff
      const wristGeo = new THREE.CylinderGeometry(0.23 * scaleF, 0.26 * scaleF, 0.42, 20);
      const wristMat = new THREE.MeshStandardMaterial({
        color: isFemaleOwner ? 0x4a044e : 0x0f172a,
        roughness: 0.45,
        metalness: 0.3,
      });
      const wrist = registerPart(new THREE.Mesh(wristGeo, wristMat));
      wrist.rotation.x = Math.PI / 2;
      wrist.position.set(0, 0.13 * scaleF, -0.42);
      handGroup.add(wrist);

      if (isFemaleOwner) {
        const braceletGeo = new THREE.TorusGeometry(0.25 * scaleF, 0.016, 12, 32);
        const braceletMat = new THREE.MeshStandardMaterial({
          color: 0xf59e0b,
          metalness: 0.95,
          roughness: 0.15,
        });
        const bracelet = registerPart(new THREE.Mesh(braceletGeo, braceletMat));
        bracelet.rotation.x = Math.PI / 2;
        bracelet.position.set(0, 0.13 * scaleF, -0.32);
        handGroup.add(bracelet);
      } else {
        const watchGeo = new THREE.TorusGeometry(0.26, 0.03, 12, 32);
        const watchMat = new THREE.MeshStandardMaterial({
          color: 0x1e293b,
          metalness: 0.85,
          roughness: 0.25,
        });
        const watch = registerPart(new THREE.Mesh(watchGeo, watchMat));
        watch.rotation.x = Math.PI / 2;
        watch.position.set(0, 0.13, -0.32);
        handGroup.add(watch);
      }

      // 3. Fingers Group
      const fingersGroup = new THREE.Group();
      fingersGroup.userData = { handId };
      fingersGroup.position.set(0, 0.13 * scaleF, 0.2 * scaleF);

      const fingerDefs = isLeft
        ? [
            { x: -0.19 * scaleF, kRad: 0.052 * scaleF, len: 0.22 * scaleF, width: 0.046 * scaleF },
            { x: -0.07 * scaleF, kRad: 0.061 * scaleF, len: 0.25 * scaleF, width: 0.052 * scaleF },
            { x: 0.06 * scaleF,  kRad: 0.066 * scaleF, len: 0.27 * scaleF, width: 0.056 * scaleF },
            { x: 0.18 * scaleF,  kRad: 0.062 * scaleF, len: 0.25 * scaleF, width: 0.054 * scaleF },
          ]
        : [
            { x: -0.18 * scaleF, kRad: 0.062 * scaleF, len: 0.25 * scaleF, width: 0.054 * scaleF },
            { x: -0.06 * scaleF, kRad: 0.066 * scaleF, len: 0.27 * scaleF, width: 0.056 * scaleF },
            { x: 0.07 * scaleF,  kRad: 0.061 * scaleF, len: 0.25 * scaleF, width: 0.052 * scaleF },
            { x: 0.19 * scaleF,  kRad: 0.052 * scaleF, len: 0.22 * scaleF, width: 0.046 * scaleF },
          ];

      fingerDefs.forEach((f) => {
        const knuckleGeo = new THREE.SphereGeometry(f.kRad, 14, 14);
        const knuckle = registerPart(new THREE.Mesh(knuckleGeo, mainMat));
        knuckle.position.set(f.x, 0.04 * scaleF, 0);
        fingersGroup.add(knuckle);

        const curlGeo = new THREE.CylinderGeometry(f.width * 0.95, f.width, f.len, 14);
        const curl = registerPart(new THREE.Mesh(curlGeo, mainMat));
        curl.rotation.x = Math.PI / 2.2;
        curl.position.set(f.x, 0.01 * scaleF, 0.08 * scaleF);
        fingersGroup.add(curl);

        const distalGeo = new THREE.CylinderGeometry(f.width * 0.8, f.width * 0.9, 0.12 * scaleF, 12);
        const distal = registerPart(new THREE.Mesh(distalGeo, mainMat));
        distal.rotation.x = Math.PI / 1.5;
        distal.position.set(f.x, -0.05 * scaleF, 0.13 * scaleF);
        fingersGroup.add(distal);

        const nailGeo = new THREE.PlaneGeometry(f.width * 0.72, 0.055 * scaleF);
        const nail = registerPart(new THREE.Mesh(nailGeo, nailMat));
        nail.position.set(f.x, -0.06 * scaleF, 0.16 * scaleF);
        nail.rotation.x = Math.PI * 0.75;
        fingersGroup.add(nail);
      });
      handGroup.add(fingersGroup);

      // 4. Opposable Thumb
      const thumbGroup = new THREE.Group();
      thumbGroup.userData = { handId };

      const thumbBaseX = (isLeft ? 0.21 : -0.21) * scaleF;
      const thumbDir = isLeft ? -1 : 1;

      const thumbProxGeo = new THREE.CylinderGeometry(0.062 * scaleF, 0.07 * scaleF, 0.24 * scaleF, 14);
      const thumbProx = registerPart(new THREE.Mesh(thumbProxGeo, mainMat));
      thumbProx.rotation.z = thumbDir * (Math.PI / 3);
      thumbProx.rotation.y = thumbDir * 0.35;
      thumbProx.rotation.x = -0.12;
      thumbProx.position.set(thumbBaseX, 0.15 * scaleF, 0.06 * scaleF);
      thumbGroup.add(thumbProx);

      const thumbJointGeo = new THREE.SphereGeometry(0.062 * scaleF, 12, 12);
      const thumbJoint = registerPart(new THREE.Mesh(thumbJointGeo, mainMat));
      thumbJoint.position.set(thumbBaseX + thumbDir * 0.11 * scaleF, 0.2 * scaleF, 0.11 * scaleF);
      thumbGroup.add(thumbJoint);

      const thumbDistGeo = new THREE.CylinderGeometry(0.056 * scaleF, 0.061 * scaleF, 0.22 * scaleF, 14);
      const thumbDist = registerPart(new THREE.Mesh(thumbDistGeo, mainMat));
      thumbDist.rotation.z = thumbDir * (Math.PI / 2.1);
      thumbDist.rotation.y = thumbDir * 0.15;
      thumbDist.rotation.x = -0.05;
      thumbDist.position.set(thumbBaseX + thumbDir * 0.21 * scaleF, 0.19 * scaleF, 0.12 * scaleF);
      thumbGroup.add(thumbDist);

      const thumbNailGeo = new THREE.PlaneGeometry(0.065 * scaleF, 0.07 * scaleF);
      const thumbNail = registerPart(new THREE.Mesh(thumbNailGeo, nailMat));
      thumbNail.rotation.x = -Math.PI / 2.5;
      thumbNail.rotation.z = thumbDir * (Math.PI / 2.1);
      thumbNail.position.set(thumbBaseX + thumbDir * 0.27 * scaleF, 0.21 * scaleF, 0.12 * scaleF);
      thumbGroup.add(thumbNail);

      handGroup.add(thumbGroup);

      // 5. Championship Gold Ring or Delicate Diamond Solitaire
      const ringFingerX = (isLeft ? -0.07 : 0.07) * scaleF;
      const ringGeo = new THREE.TorusGeometry(0.068 * scaleF, 0.015 * scaleF, 14, 28);
      const ringMat = new THREE.MeshStandardMaterial({
        color: 0xf59e0b,
        metalness: 0.95,
        roughness: 0.15,
      });
      const ringMesh = registerPart(new THREE.Mesh(ringGeo, ringMat));
      ringMesh.rotation.y = Math.PI / 2;
      ringMesh.position.set(ringFingerX, 0.13 * scaleF, 0.2 * scaleF);
      handGroup.add(ringMesh);

      // 6. Smooth Radial Ground Shadow
      const shadowGeo = new THREE.PlaneGeometry(1.25, 1.25);
      const shadowMat = new THREE.MeshBasicMaterial({
        map: softShadowTexture,
        transparent: true,
        depthWrite: false,
      });
      const shadow = registerPart(new THREE.Mesh(shadowGeo, shadowMat));
      shadow.rotation.x = -Math.PI / 2;
      shadow.position.y = 0.003;
      handGroup.add(shadow);

      // 7. Jewel if this hand hides it
      let jewelGroup: THREE.Group | undefined;
      if (hasGol) {
        jewelGroup = createProceduralJewel(jewelType);
        jewelGroup.position.set(0, 0.12, 0);
        jewelGroup.visible = false;
        handGroup.add(jewelGroup);
      }

      scene.add(handGroup);

      return {
        id: handId,
        group: handGroup,
        palmMesh,
        fingersGroup,
        thumbMesh: thumbProx,
        ringMesh,
        jewelGroup,
        targetY: 0,
        targetRotX: 0,
        targetOpen: 0,
        currentOpen: 0,
        baseX: isLeft ? -0.85 : 0.85,
        currentX: isLeft ? -0.85 : 0.85,
      };
    }

    // 10. Sync 3D Hand meshes with state
    function updateHandsLayout() {
      const currentHands = propsRef.current.hands;
      const currentSkin = propsRef.current.selectedSkinId;
      const currentJewel = propsRef.current.selectedJewelId;
      const isFemaleOwner = propsRef.current.opponentGender === 'female';

      handNodesRef.current.forEach((node, id) => {
        if (!currentHands.find((h) => h.id === id)) {
          scene.remove(node.group);
          handNodesRef.current.delete(id);
        }
      });

      const total = currentHands.length;
      currentHands.forEach((hand, idx) => {
        let node = handNodesRef.current.get(hand.id);

        if (!node) {
          node = createProceduralHand(
            hand.id,
            hand.handSide,
            currentSkin,
            hand.hasGol,
            currentJewel,
            isFemaleOwner
          );
          handNodesRef.current.set(hand.id, node);
        }

        let posX = 0;
        let posZ = 0;
        let rotY = 0;

        if (total === 2) {
          posX = hand.handSide === 'left' ? -0.85 : 0.85;
          posZ = 0.25;
          rotY = hand.handSide === 'left' ? 0.08 : -0.08;
        } else if (total === 4) {
          const offsets = [-1.4, -0.45, 0.45, 1.4];
          posX = offsets[idx % 4];
          posZ = 0.2;
          rotY = (idx - 1.5) * -0.05;
        } else {
          const angle = -Math.PI * 0.4 + (idx / Math.max(1, total - 1)) * (Math.PI * 0.8);
          const radius = 1.6;
          posX = Math.sin(angle) * radius;
          posZ = Math.cos(angle) * radius - 0.7;
          rotY = -angle * 0.45;
        }

        node.baseX = posX;
        node.group.position.z = posZ;
        node.group.rotation.y = rotY;

        if (hand.isOpened) {
          node.targetOpen = 1.0;
          node.targetY = 0.22;
          node.targetRotX = -Math.PI * 0.22;
          if (node.jewelGroup) {
            node.jewelGroup.visible = true;
          }
        } else {
          node.targetOpen = 0.0;
          node.targetY = 0;
          node.targetRotX = 0;
          if (node.jewelGroup) {
            node.jewelGroup.visible = false;
          }
        }
      });
    }

    updateHandsLayout();

    // 11. Animation Tick Loop
    const clock = new THREE.Clock();

    function tick() {
      const delta = Math.min(clock.getDelta(), 0.1);
      const elapsed = clock.getElapsedTime();

      updateHandsLayout();

      // Camera transitions
      const targetCam = propsRef.current.cameraView;
      let targetCamPos = { x: 0, y: 3.8, z: 6.2 };
      let targetLookY = 0.4;

      if (targetCam === 'top') {
        targetCamPos = { x: 0, y: 5.5, z: 1.2 };
        targetLookY = 0.1;
      } else if (targetCam === 'cinematic') {
        targetCamPos = { x: 3.2, y: 2.6, z: 3.6 };
        targetLookY = 0.6;
      }

      camera.position.x = THREE.MathUtils.damp(camera.position.x, targetCamPos.x, 3.5, delta);
      camera.position.y = THREE.MathUtils.damp(camera.position.y, targetCamPos.y, 3.5, delta);
      camera.position.z = THREE.MathUtils.damp(camera.position.z, targetCamPos.z, 3.5, delta);
      camera.lookAt(0, targetLookY, 0);

      // Handle 3D Sleight-of-hand / Shell Shuffling Animation
      const shuffle = shuffleStateRef.current;
      if (shuffle.active) {
        shuffle.timer += delta;
        const progress = Math.min(1.0, shuffle.timer / shuffle.duration);

        const currentSwapFloat = progress * shuffle.swaps;
        const currentSwapIndex = Math.floor(currentSwapFloat);

        if (currentSwapIndex > shuffle.lastSwapIndex) {
          shuffle.lastSwapIndex = currentSwapIndex;
          sound.playWhoosh();
        }

        const swapFactor = Math.sin(progress * Math.PI * shuffle.swaps);
        const arcLift = Math.sin(progress * Math.PI) * 0.42;

        const leftNode = handNodesRef.current.get(0);
        const rightNode = handNodesRef.current.get(1);

        if (leftNode && rightNode) {
          leftNode.group.position.x = -0.85 * Math.cos(progress * Math.PI * shuffle.swaps);
          leftNode.group.position.y = 0.15 + arcLift + Math.abs(swapFactor) * 0.18;
          leftNode.group.position.z = 0.25 + Math.sin(currentSwapFloat * Math.PI) * 0.15;

          rightNode.group.position.x = 0.85 * Math.cos(progress * Math.PI * shuffle.swaps);
          rightNode.group.position.y = 0.15 + arcLift * 0.7;
          rightNode.group.position.z = 0.25 - Math.sin(currentSwapFloat * Math.PI) * 0.15;
        }

        if (progress >= 1.0) {
          shuffle.active = false;
          sound.playFistThud();
        }
      }

      // Animate hands & jewels
      const selectedId = propsRef.current.selectedHandId;
      const highlightedId = propsRef.current.highlightedHandId;

      handNodesRef.current.forEach((node) => {
        if (!shuffle.active) {
          node.group.position.x = THREE.MathUtils.damp(node.group.position.x, node.baseX, 6.0, delta);
          node.group.position.z = THREE.MathUtils.damp(node.group.position.z, 0.25, 6.0, delta);
        }

        node.currentOpen = THREE.MathUtils.damp(node.currentOpen, node.targetOpen, 5.0, delta);
        node.fingersGroup.rotation.x = -node.currentOpen * Math.PI * 0.55;
        node.thumbMesh.rotation.y = node.currentOpen * 0.4;

        let liftY = node.targetY;
        if (node.id === selectedId) {
          liftY += 0.12 + Math.sin(elapsed * 6) * 0.03;
        }

        if (node.id === highlightedId) {
          liftY += Math.sin(elapsed * 18) * 0.015;
          node.group.position.x += Math.cos(elapsed * 24) * 0.005;
        }

        if (!shuffle.active) {
          node.group.position.y = THREE.MathUtils.damp(node.group.position.y, liftY, 6.0, delta);
        }
        node.group.rotation.x = THREE.MathUtils.damp(node.group.rotation.x, node.targetRotX, 5.0, delta);

        if (node.jewelGroup && node.jewelGroup.visible) {
          node.jewelGroup.rotation.y += delta * 2.2;
          node.jewelGroup.position.y = 0.22 + Math.sin(elapsed * 4) * 0.06;
        }
      });

      // Animate 3D Avatar (Breathing, Eye Blinking, Eye Gaze Tracking, Emotions)
      const rig = avatarRigRef.current;
      if (rig) {
        const breath = Math.sin(elapsed * 2.2) * 0.018;
        rig.torso.position.y = 0.75 + breath;
        rig.head.position.y = 1.48 + breath * 1.2;

        const blinkCycle = elapsed % 3.8;
        let blinkScale = 0.05;
        if (blinkCycle < 0.16) {
          blinkScale = Math.sin((blinkCycle / 0.16) * Math.PI) * 0.95;
        }
        rig.leftEyelid.scale.y = blinkScale;
        rig.rightEyelid.scale.y = blinkScale;

        let eyeTargetX = 0;
        let headTargetRotY = 0;
        const gaze = propsRef.current.gazeDirection;

        if (shuffle.active) {
          eyeTargetX = Math.sin(elapsed * 8) * 0.022;
          headTargetRotY = Math.sin(elapsed * 8) * 0.08;
        } else if (gaze === 'left') {
          eyeTargetX = -0.018;
          headTargetRotY = 0.12;
        } else if (gaze === 'right') {
          eyeTargetX = 0.018;
          headTargetRotY = -0.12;
        }

        rig.leftEye.position.x = THREE.MathUtils.damp(rig.leftEye.position.x, eyeTargetX, 8.0, delta);
        rig.rightEye.position.x = THREE.MathUtils.damp(rig.rightEye.position.x, eyeTargetX, 8.0, delta);
        rig.head.rotation.y = THREE.MathUtils.damp(rig.head.rotation.y, headTargetRotY, 5.0, delta);

        const emotion = propsRef.current.characterEmotion;
        let browTilt = 0.1;
        let headTiltZ = 0;

        if (emotion === 'bluff') {
          browTilt = 0.28;
          headTiltZ = 0.08;
        } else if (emotion === 'shock') {
          browTilt = -0.15;
          rig.mouth.scale.set(1.4, 2.5, 1.4);
        } else if (emotion === 'triumph') {
          browTilt = 0.05;
          rig.mouth.scale.set(1.5, 0.8, 1.0);
        } else {
          rig.mouth.scale.set(1.0, 1.0, 1.0);
        }

        rig.leftEyebrow.rotation.z = THREE.MathUtils.damp(rig.leftEyebrow.rotation.z, browTilt, 6.0, delta);
        rig.rightEyebrow.rotation.z = THREE.MathUtils.damp(rig.rightEyebrow.rotation.z, -browTilt, 6.0, delta);
        rig.head.rotation.z = THREE.MathUtils.damp(rig.head.rotation.z, headTiltZ, 4.0, delta);
      }

      renderer.render(scene, camera);

      if (isSoftwareGl) {
        const gl = renderer.getContext() as WebGL2RenderingContext;
        const sync = gl.fenceSync(gl.SYNC_GPU_COMMANDS_COMPLETE, 0);
        gl.flush();
        const poll = () => {
          const state = sync && gl.getSyncParameter(sync, gl.SYNC_STATUS);
          if (state === gl.UNSIGNALED) {
            animationFrameIdRef.current = window.setTimeout(poll, 6);
          } else {
            if (sync) gl.deleteSync(sync);
            animationFrameIdRef.current = window.setTimeout(tick, 75);
          }
        };
        animationFrameIdRef.current = window.setTimeout(poll, 6);
      } else {
        animationFrameIdRef.current = requestAnimationFrame(tick);
      }
    }

    tick();

    const handNodes = handNodesRef.current;

    // 12. Cleanup
    return () => {
      cancelAnimationFrame(animationFrameIdRef.current);
      clearTimeout(animationFrameIdRef.current);
      window.removeEventListener('resize', handleResize);
      domElem.removeEventListener('click', handleClick);
      domElem.removeEventListener('pointermove', handlePointerMove);

      handNodes.forEach((node) => {
        scene.remove(node.group);
      });
      handNodes.clear();

      if (avatarGroupRef.current) {
        scene.remove(avatarGroupRef.current);
      }

      renderer.dispose();
      if (domElem.parentNode) {
        domElem.parentNode.removeChild(domElem);
      }
    };
  }, []);

  return (
    <div className="relative w-full h-full min-h-[380px] select-none touch-none">
      <div ref={containerRef} className="absolute inset-0 w-full h-full overflow-hidden" />
    </div>
  );
}
