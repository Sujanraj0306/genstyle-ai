import React, { useRef, useEffect } from 'react';
import Webcam from 'react-webcam';
import * as bodyPix from '@tensorflow-models/body-pix';
import * as tf from '@tensorflow/tfjs';

function VirtualTryOn({ clothingUrl, onBack }) {
  const webcamRef = useRef(null);
  const canvasRef = useRef(null);

  // Smoothing factor (0.2 → smoother, 0.8 → more responsive but jittery)
  const SMOOTHING = 0.4;
  let lastPose = null;

  // Linear interpolation helper
  const lerp = (a, b, t) => a + (b - a) * t;

  // Smooth pose keypoints
  const smoothPose = (oldPose, newPose) => {
    if (!oldPose) return newPose;
    return {
      ...newPose,
      keypoints: newPose.keypoints.map((kp, i) => ({
        ...kp,
        position: {
          x: lerp(oldPose.keypoints[i].position.x, kp.position.x, SMOOTHING),
          y: lerp(oldPose.keypoints[i].position.y, kp.position.y, SMOOTHING)
        }
      }))
    };
  };

  // Draw clothing
  const drawOverlay = (pose, clothingImage, ctx) => {
    if (!pose) return;

    const nose = pose.keypoints.find(k => k.part === 'nose');
    const leftShoulder = pose.keypoints.find(k => k.part === 'leftShoulder');
    const rightShoulder = pose.keypoints.find(k => k.part === 'rightShoulder');
    const leftHip = pose.keypoints.find(k => k.part === 'leftHip');
    const rightHip = pose.keypoints.find(k => k.part === 'rightHip');

    if (nose && leftShoulder && rightShoulder && leftHip && rightHip) {
      const torsoWidth = Math.abs(rightShoulder.position.x - leftShoulder.position.x);
      const torsoHeight =
        ((leftHip.position.y + rightHip.position.y) / 2) -
        ((leftShoulder.position.y + rightShoulder.position.y) / 2);

      const width = torsoWidth * 2.7;
      const height = torsoHeight * 1.5;

      const centerX = (leftShoulder.position.x + rightShoulder.position.x) / 2;

      const y = nose.position.y - height * (-0.07); 
      const x = centerX - width / 2;

      ctx.drawImage(clothingImage, x, y, width, height);
    }
  };

  useEffect(() => {
    let net;
    let intervalId;
    const clothingImage = new Image();
    clothingImage.crossOrigin = "anonymous";
    clothingImage.src = clothingUrl;

    const setupAndRun = async () => {
      await tf.ready();
      net = await bodyPix.load({
        architecture: 'MobileNetV1',
        outputStride: 16,
        multiplier: 0.75,
        quantBytes: 2
      });

      clothingImage.onload = () => {
        intervalId = setInterval(() => {
          if (webcamRef.current && webcamRef.current.video.readyState === 4) {
            const video = webcamRef.current.video;
            const canvas = canvasRef.current;
            canvas.width = video.videoWidth;
            canvas.height = video.videoHeight;
            const ctx = canvas.getContext('2d');

            net.segmentPerson(video, { 
              flipHorizontal: false,   // keep this false since webcam is correct
              internalResolution: 'medium', 
              segmentationThreshold: 0.7 
            })
            .then(personSegmentation => {
              ctx.clearRect(0, 0, canvas.width, canvas.height);

              const newPose = personSegmentation.allPoses[0];
              if (newPose) {
                lastPose = smoothPose(lastPose, newPose); 
              }

              if (lastPose) {
                // ✅ flip only the shirt drawing
                ctx.save();
                ctx.translate(canvas.width, 0);
                ctx.scale(-1, 1);

                drawOverlay(lastPose, clothingImage, ctx);

                ctx.restore();
              }
            });

          }
        },400); // run every 150ms (more stable than 100ms)
      };
    };

    setupAndRun();

    return () => {
      clearInterval(intervalId);
    };
  }, [clothingUrl]);

  return (
    <div className="try-on-container">
      <button onClick={onBack} className="back-button">Back</button>
      <Webcam
        ref={webcamRef}
        mirrored={true}
        style={{
          position: 'absolute',
          left: 0,
          right: 0,
          margin: 'auto',
          textAlign: 'center',
          zIndex: 9,
          width: 640,
          height: 480
        }}
      />
      <canvas
        ref={canvasRef}
        style={{
          position: 'absolute',
          left: 0,
          right: 0,
          top: 0,
          margin: 'auto',
          textAlign: 'center',
          zIndex: 10,
          width: 640,
          height: 480
        }}
      />
    </div>
  );
}

export default VirtualTryOn;
