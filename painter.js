function initializeCanvas(canvasId, width, height) {
  const canvas = document.getElementById(canvasId);
  const ctx = canvas.getContext('2d');
  let isDrawing = false;
  let lineWidth = 5;
  let color = '#000';

  canvas.width = width;
  canvas.height = height;

  canvas.addEventListener('mousedown', startDrawing);
  canvas.addEventListener('mousemove', draw);
  canvas.addEventListener('mouseup', stopDrawing);
  canvas.addEventListener('mouseout', stopDrawing);

  document
    .getElementById('lineWidthInput')
    .addEventListener('input', updateLineWidth);

  function startDrawing(e) {
    isDrawing = true;
    draw(e);
  }

  function draw(e) {
    if (!isDrawing) return;

    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width; // Relationship bitmap vs. element for X
    const scaleY = canvas.height / rect.height; // Relationship bitmap vs. element for Y

    const x = (e.clientX - rect.left) * scaleX;
    const y = (e.clientY - rect.top) * scaleY;

    ctx.lineWidth = lineWidth;
    ctx.lineCap = 'round';
    ctx.strokeStyle = color;

    ctx.lineTo(x, y);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(x, y);
  }

  function stopDrawing() {
    isDrawing = false;
    ctx.beginPath();
  }

  function updateLineWidth(e) {
    lineWidth = e.target.value;
  }

  window.changeColor = function (newColor) {
    color = newColor;
  };
}

initializeCanvas('paintCanvas', 1200, 700);



async function getCode() {
  const username = window.location.pathname.split('/')[2];

  const res = await fetch(`/api/code/${username}`, {
    method: "GET",
    headers: {
      "content-type": "application/json"
    }
  });

  const code = await res.json();
  return code.profileCode;
}



document.addEventListener("DOMContentLoaded", async function () {
  const canvas = document.getElementById("paintCanvas");
  const saveButton = document.getElementById("saveButton");
  const username = window.location.pathname.split('/')[2];
  console.log(username)

  saveButton.addEventListener("click", function () {
      saveCanvas(canvas, username);
  });

  async function generateUniqueID() {
    let img_id = Math.floor(Math.random() * 1000000); // Initial random img_id
  
    try {
      while (true) {
        const res = await fetch('/check-id', {
          method: "POST",
          headers: {
            "content-type": "application/json"
          },
          body: JSON.stringify({ img_id })
        });
  
        if (!res.ok) {
          throw new Error("Failed to check if img_id exists.");
        }
  
        const data = await res.json();
        if (data.available) {
          return img_id;
        } else {
          // If img_id already exists, generate a new random img_id
          img_id = Math.floor(Math.random() * 1000000);
        }
      }
    } catch (error) {
      console.error("Error:", error.message);
    }
  }


  async function saveCanvas(canvas, username) {
      try {

          const code = await getCode();


          const img_id = await generateUniqueID();
          
          // Convert canvas to image data URL
          const imageData = canvas.toDataURL(); // Example: Convert canvas to base64 data URL

          // Send HTTP POST request to server endpoint
          const response = await fetch("/save-canvas", {
              method: "POST",
              headers: {
                  "Content-Type": "application/json"
              },
              body: JSON.stringify({ img_id, username, img_data: imageData, profileCode: code })
          });

          if (response.ok) {
              alert("Canvas image saved successfully!");
          } else {
              throw new Error("Failed to save canvas image.");
          }
      } catch (error) {
          console.error("Error:", error);
          alert("Error saving canvas image. Please try again.");
      }
  }
});

