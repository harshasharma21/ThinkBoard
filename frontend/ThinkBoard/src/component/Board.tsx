import React, { useRef, useEffect, useState } from 'react';
import io from 'socket.io-client';

interface MyBoard {
    brushColor: string;
    brushSize: number;
}

const Board: React.FC<MyBoard> = (props) => {

    const { brushColor, brushSize } = props;
    const canvasRef = useRef<HTMLCanvasElement>(null);

    const [socket, setSocket] = useState(null);

    useEffect(() => {
        const backendURL = "https://your-backend-service.onrender.com";
        const newSocket = io(backendURL);
        console.log(newSocket, "Connected to socket");
        setSocket(newSocket as any);
    }, []);


    useEffect(() => {
        if (socket) {
            // Event listener for receiving canvas data from the socket
            (socket as any).on('canvasImage', (data: string) => {
                // Create an image object from the data URL
                const image = new Image();
                image.src = data;

                const canvas = canvasRef.current;
                const ctx = canvas?.getContext('2d');
                // Draw the image onto the canvas
                image.onload = () => {
                    ctx?.drawImage(image, 0, 0);
                };
            });
        }
    }, [socket]);


    // Function to start drawing
    useEffect(() => {

            // Variables to store drawing state
            let isDrawing = false;
            let lastX = 0;
            let lastY = 0;
            const startDrawing = (e: { offsetX: number; offsetY: number; }) => {
                isDrawing = true;

                console.log(`drawing started`, brushColor, brushSize);
                [lastX, lastY] = [e.offsetX, e.offsetY];
            };

            // Function to draw
            const draw = (e: { offsetX: number; offsetY: number; }) => {
                if (!isDrawing) return;

                const canvas = canvasRef.current;
                const ctx = canvas?.getContext('2d');
                if (ctx) {
                    ctx.beginPath();
                    ctx.moveTo(lastX, lastY);
                    ctx.lineTo(e.offsetX, e.offsetY);
                    ctx.stroke();
                }

                [lastX, lastY] = [e.offsetX, e.offsetY];
            };

            // Function to end drawing
            const endDrawing = () => {
                const canvas = canvasRef.current;
                if (canvas) {
                    const dataURL = canvas.toDataURL(); // Get the data URL of the canvas content

                    // Send the dataURL or image data to the socket
                    if (socket) {
                        (socket as any).emit('canvasImage', dataURL);
                        console.log('drawing ended');
                    }
                    isDrawing = false;
                }
            };

            const canvas = canvasRef.current;
            const ctx = canvas?.getContext('2d');

            // Set initial drawing styles
            if (ctx) {
                ctx.strokeStyle = brushColor;
                ctx.lineWidth = brushSize;

                ctx.lineCap = 'round';
                ctx.lineJoin = 'round';

            }
            // Event listeners for drawing
            if (canvas) {
                canvas.addEventListener('mousedown', startDrawing);
                canvas.addEventListener('mousemove', draw);
                canvas.addEventListener('mouseup', endDrawing);
                canvas.addEventListener('mouseout', endDrawing);
            }

            return () => {
                // Clean up event listeners when component unmounts
                if (canvas) {
                    canvas.removeEventListener('mousedown', startDrawing);
                    canvas.removeEventListener('mousemove', draw);
                    canvas.removeEventListener('mouseup', endDrawing);
                    canvas.removeEventListener('mouseout', endDrawing);
                }
            };
        }, [brushColor, brushSize, socket]);

    const [windowSize, setWindowSize] = useState([
        window.innerWidth,
        window.innerHeight,
    ]);

    useEffect(() => {
        const handleWindowResize = () => {
            setWindowSize([window.innerWidth, window.innerHeight]);
        };

        window.addEventListener('resize', handleWindowResize);

        return () => {
            window.removeEventListener('resize', handleWindowResize);
        };
    }, []);


    return (
        <canvas
            ref={canvasRef}
            width={windowSize[0] > 600 ? 600 : 300}
            height={windowSize[1] > 400 ? 400 : 200}
            style={{ backgroundColor: 'white' }}
        />
    );
};

export default Board;
