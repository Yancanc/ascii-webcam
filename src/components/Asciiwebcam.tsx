import { useEffect } from "react";
import * as THREE from "three";

const asciiChars = ["@", "#", "S", "%", "?", "*", "+", ";", ":", ",", "."];
const asciiHeader = `
     _____  _____ _____ _____    _____          __  __ 
  /\\    / ____|/ ____|_   _|_   _|  / ____|   /\\   |  \\/  |
 /  \\  | (___ | |      | |   | |   | |       /  \\  | \\  / |
/ /\\ \\  \\___ \\| |      | |   | |   | |      / /\\ \\ | |\\/| |
/ ____ \\ ____) | |____ _| |_ _| |_  | |____ / ____ \\| |  | |
/_/    \\_\\_____/ \\_____|_____|_____|  \\____/_/    \\_\\_|  |_|
`;

const asciiFooter = `
  _                                                          _ _       
 | |                                                        | | |      
 | |__  _   _   _   _  __ _ _ __     ___ __ _ _ __   ___ ___| | | __ _ 
 | '_ \\| | | | | | | |/ _ \` | '_ \\   / __/ _\` | '_ \\ / __/ _ \\ | |/ _\` |
 | |_) | |_| | | |_| | (_| | | | | | (_| (_| | | | | (_|  __/ | | (_| |
 |_.__/ \\__, |  \\__, |\\__,_|_| |_|  \\___\\__,_|_| |_|\\___\\___|_|_|\\__,_|
         __/ |   __/ |                                                 
        |___/   |___/                                                  
`;

export default function AsciiWebcam() {
  useEffect(() => {
    let renderer: THREE.WebGLRenderer,
      scene: THREE.Scene,
      camera: THREE.OrthographicCamera;
    let webCam: HTMLVideoElement;
    const asciiCanvas = document.getElementById(
      "asciiCanvas"
    ) as HTMLDivElement;
    const headerCanvas = document.getElementById("header") as HTMLDivElement;
    const footerCanvas = document.getElementById("footer") as HTMLDivElement;

    headerCanvas.textContent = asciiHeader;
    footerCanvas.textContent = asciiFooter;

    init();

    function init() {
      renderer = new THREE.WebGLRenderer({
        canvas: document.querySelector("#myCanvas") as HTMLCanvasElement,
      });
      renderer.setPixelRatio(window.devicePixelRatio);
      renderer.setSize(window.innerWidth, window.innerHeight);

      scene = new THREE.Scene();

      camera = new THREE.OrthographicCamera(
        window.innerWidth / -2,
        window.innerWidth / 2,
        window.innerHeight / 2,
        window.innerHeight / -2,
        1,
        1000
      );
      camera.position.z = 1;

      initWebCam();

      const render = () => {
        drawAscii();
        renderer.render(scene, camera);
        requestAnimationFrame(render);
      };
      render();
    }

    function initWebCam() {
      webCam = document.createElement("video");
      webCam.id = "webcam";
      webCam.autoplay = true;
      webCam.width = 640;
      webCam.height = 480;

      const option = {
        video: { facingMode: "user" },
        audio: false,
      };

      navigator.mediaDevices
        .getUserMedia(option)
        .then(function (stream) {
          webCam.srcObject = stream;
        })
        .catch(function (e) {
          alert("ERROR: " + e.message);
        });
    }

    function getImageData(image: HTMLVideoElement) {
      const w = image.width;
      const h = image.height;

      const canvas = document.createElement("canvas");
      const ctx = canvas.getContext("2d");

      if (ctx) {
        canvas.width = w;
        canvas.height = h;

        ctx.drawImage(image, 0, 0);
        const imageData = ctx.getImageData(0, 0, w, h);

        return imageData;
      }
      return null;
    }

    function drawAscii() {
      if (!webCam) return;

      const imageData = getImageData(webCam);
      if (!imageData) return;

      const width = imageData.width;
      const height = imageData.height;
      let asciiImage = "";

      for (let y = 0; y < height; y += 6) {
        let row = "";
        for (let x = 0; x < width; x += 3) {
          const offset = (y * width + x) * 4;
          const r = imageData.data[offset] / 255;
          const g = imageData.data[offset + 1] / 255;
          const b = imageData.data[offset + 2] / 255;
          const gray = (r + g + b) / 3;
          const charIndex = Math.floor(gray * (asciiChars.length - 1));
          row += asciiChars[charIndex];
        }
        asciiImage += row + "\n";
      }

      asciiCanvas.textContent = asciiImage;
    }

    function onResize() {
      const width = window.innerWidth;
      const height = window.innerHeight;

      renderer.setPixelRatio(window.devicePixelRatio);
      renderer.setSize(width, height);

      camera.left = width / -2;
      camera.right = width / 2;
      camera.top = height / 2;
      camera.bottom = height / -2;
      camera.updateProjectionMatrix();
    }

    window.addEventListener("resize", onResize);

    return () => {
      window.removeEventListener("resize", onResize);
    };
  }, []);

  return (
    <div>
      <div id="header"></div>
      <canvas id="myCanvas" style={{ display: "none" }}></canvas>
      <div id="asciiCanvas"></div>
      <div id="footer"></div>
    </div>
  );
}
