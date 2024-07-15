import Head from "next/head";
import AsciiWebcam from "../components/Asciiwebcam";
import "../styles/global.css";

export default function Home() {
  return (
    <div>
      <Head>
        <title>Three.js WebCam ASCII Visualizer</title>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>
      <AsciiWebcam />
    </div>
  );
}
