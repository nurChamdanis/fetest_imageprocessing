import { useEffect, useRef, useState } from 'react';
import Head from 'next/head';
import styles from '../styles/Home.module.css';

const Home: React.FC = () => {
  const imgElementRef = useRef<HTMLImageElement | null>(null);
  const inputElementRef = useRef<HTMLInputElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [cv, setCv] = useState<any>(null);

  useEffect(() => {
    const loadOpenCV = () => {
      if ((window as any).cv) {
        setCv((window as any).cv);
      } else {
        const script = document.createElement('script');
        script.src = 'https://docs.opencv.org/4.x/opencv.js';
        script.async = true;
        script.onload = () => {
          setCv((window as any).cv);
        };
        document.body.appendChild(script);
      }
    };

    loadOpenCV();

    const inputElement = inputElementRef.current;
    const canvasElement = canvasRef.current;

    const handleFileChange = (e: Event) => {
      const target = e.target as HTMLInputElement;
      const files = target.files;

      if (files && files.length > 0) {
        const file = files[0];

        if (!['image/png', 'image/jpeg', 'image/jpg'].includes(file.type)) {
          setError('Invalid file type. Please upload a PNG or JPEG image.');
          return;
        }


        if (file.size > 2 * 1024 * 1024) {
          setError('File size must not exceed 2MB.');
          return;
        } else {
          setError(null);
        }

        // Create object URL and set image source
        const url = URL.createObjectURL(file);
        const imgElement = imgElementRef.current;

        if (imgElement) {
          imgElement.src = url;

          // Clean up the object URL after the image is loaded
          imgElement.onload = () => {
            // Process the image once it has been loaded
            processImage();
            URL.revokeObjectURL(url); // Release memory after processing
          };
        }
      }
    };

    if (inputElement) {
      inputElement.addEventListener('change', handleFileChange);
    }

    const processImage = () => {
      const imgElement = imgElementRef.current;
      if (!cv || !imgElement || !canvasElement) return;

      const mat = cv.imread(imgElement);
      if (!mat) {
        console.error('Failed to read image.');
        return;
      }

      const width = 400;
      const aspectRatio = mat.rows / mat.cols;
      const height = Math.round(width * aspectRatio);
      const resizedMat = new cv.Mat();
      cv.resize(mat, resizedMat, new cv.Size(width, height));

      const ctx = canvasElement.getContext('2d');
      if (ctx) {
        canvasElement.width = resizedMat.cols;
        canvasElement.height = resizedMat.rows;
        const imgData = new ImageData(new Uint8ClampedArray(resizedMat.data), resizedMat.cols, resizedMat.rows);
        ctx.putImageData(imgData, 0, 0);
      }

      mat.delete();
      resizedMat.delete();
    };

    const interval = setInterval(() => {
      if (cv) {
        document.getElementById('status')!.innerHTML = 'OpenCV.js is ready.';
        clearInterval(interval);
      }
    }, 100);

    return () => {
      clearInterval(interval);
      if (inputElement) {
        inputElement.removeEventListener('change', handleFileChange);
      }
    };
  }, [cv]);

  const downloadImage = () => {
    const canvasElement = canvasRef.current;
    if (canvasElement) {
      const link = document.createElement('a');
      link.href = canvasElement.toDataURL('image/jpeg', 0.9);
      link.download = 'processed_image.jpg';
      link.click();
    }
  };

  return (
    <div className={styles.container}>
      <Head>
        <title>FE Test</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <main>
        <h3>Image Processing</h3>
        <h6>using OpenCV</h6>
        <p id="status">OpenCV.js is loading...</p>
        {error && <p style={{ color: 'red' }}>{error}</p>}
        <div>
          <p>Please follow these instructions:</p>
          <p>1. Upload your file image using only png/jpeg/jpg</p>
          <p>2. The image must not exceed 2MB.</p>
          <input type="file" ref={inputElementRef} accept="image/png, image/jpeg" />
        </div>
        <div>
          <div className="inputoutput">
            <img id="imageSrc" alt="No Image" ref={imgElementRef} style={{ maxWidth: '300px', maxHeight: '300px' }} />
            <div className="caption">Image Original</div>
          </div>
          <div className="inputoutput">
            <canvas id="canvasOutput" ref={canvasRef}></canvas>
            <div className="caption">Image Output</div>
          </div>
        </div>
        <button onClick={downloadImage}>Download Image</button>
      </main>
      <footer></footer>

      <style jsx>{`
        .inputoutput {
          display: inline-block;
          margin: 10px;
        }
      `}</style>

      <style jsx global>{`
        html,
        body {
          padding: 0;
          margin: 0;
          font-family:
            -apple-system,
            BlinkMacSystemFont,
            Segoe UI,
            Roboto,
            Oxygen,
            Ubuntu,
            Cantarell,
            Fira Sans,
            Droid Sans,
            Helvetica Neue,
            sans-serif;
        }
        * {
          box-sizing: border-box;
        }
      `}</style>
    </div>
  );
};

export default Home;
