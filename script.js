/*
=========================================
FIREBASE
=========================================
*/

import "./firebase-config.js";


/*
=========================================
DOM ELEMENTS
=========================================
*/

const fileInput =
  document.getElementById("fileInput");

const dropZone =
  document.getElementById("dropZone");

const analyzeBtn =
  document.getElementById("analyzeBtn");

const preview =
  document.getElementById("preview");

const results =
  document.getElementById("results");

const progressContainer =
  document.getElementById("progressContainer");

const progress =
  document.getElementById("progress");


/*
=========================================
SELECTED IMAGE
=========================================
*/

let selectedImage = null;


/*
=========================================
API CONFIGURATION
=========================================

IMPORTANT:

Do NOT put real secret keys in GitHub.

For production, move these API requests
to a backend/serverless function.
=========================================
*/

const IMGBB_API_KEY =
  "YOUR_IMGBB_API_KEY";

const GROQ_API_KEY =
  "YOUR_GROQ_API_KEY";


/*
=========================================
FILE INPUT
=========================================
*/

fileInput.addEventListener(
  "change",
  (event) => {

    const file =
      event.target.files[0];

    if (file) {

      if (!file.type.startsWith("image/")) {

        showError(
          "Please select a valid image file."
        );

        return;
      }

      displayImage(file);
    }

  }
);


/*
=========================================
DROP ZONE CLICK
=========================================
*/

dropZone.addEventListener(
  "click",
  () => {

    fileInput.click();

  }
);


/*
=========================================
DRAG OVER
=========================================
*/

dropZone.addEventListener(
  "dragover",
  (event) => {

    event.preventDefault();

    dropZone.classList.add(
      "dragover"
    );

  }
);


/*
=========================================
DRAG LEAVE
=========================================
*/

dropZone.addEventListener(
  "dragleave",
  () => {

    dropZone.classList.remove(
      "dragover"
    );

  }
);


/*
=========================================
DROP
=========================================
*/

dropZone.addEventListener(
  "drop",
  (event) => {

    event.preventDefault();

    dropZone.classList.remove(
      "dragover"
    );

    const file =
      event.dataTransfer.files[0];

    if (
      file &&
      file.type.startsWith("image/")
    ) {

      displayImage(file);

    } else {

      showError(
        "Please drop a valid image file."
      );

    }

  }
);


/*
=========================================
DISPLAY IMAGE
=========================================
*/

function displayImage(file) {

  selectedImage = file;

  const img =
    document.createElement("img");

  img.src =
    URL.createObjectURL(file);

  img.alt =
    "Selected food image";

  preview.innerHTML = "";

  preview.appendChild(img);

  analyzeBtn.disabled = false;

  results.innerHTML = "";

}


/*
=========================================
UPLOAD IMAGE TO IMGBB
=========================================
*/

async function uploadToImgBB(file) {

  if (
    !IMGBB_API_KEY ||
    IMGBB_API_KEY ===
      "YOUR_IMGBB_API_KEY"
  ) {

    throw new Error(
      "ImgBB API key is not configured."
    );

  }


  const formData =
    new FormData();

  formData.append(
    "image",
    file
  );


  progressContainer.classList.remove(
    "hidden"
  );

  progress.style.width =
    "30%";


  try {

    const response =
      await fetch(
        `https://api.imgbb.com/1/upload?key=${IMGBB_API_KEY}`,
        {
          method: "POST",
          body: formData
        }
      );


    const data =
      await response.json();


    console.log(
      "ImgBB Response:",
      data
    );


    if (data.success) {

      progress.style.width =
        "60%";

      return data.data.url;

    }


    throw new Error(
      "ImgBB upload failed: " +
      (
        data.error?.message ||
        "Unknown error"
      )
    );

  }

  catch (error) {

    throw new Error(
      "ImgBB API error: " +
      error.message
    );

  }

}


/*
=========================================
FETCH CALORIE DATA FROM GROQ
=========================================
*/

async function fetchCalorieData(
  imageUrl
) {

  if (
    !GROQ_API_KEY ||
    GROQ_API_KEY ===
      "YOUR_GROQ_API_KEY"
  ) {

    throw new Error(
      "Groq API key is not configured."
    );

  }


  const payload = {

    messages: [

      {

        role: "user",

        content: [

          {

            type: "text",

            text:
              `Analyze the food in this image.

Return JSON only in exactly this format:

{
  "items": [
    {
      "item_name": "name of food",
      "total_calories": 0,
      "total_protein": 0,
      "total_carbs": 0,
      "total_fats": 0
    }
  ]
}

Estimate the nutritional values for each visible food item.
Calories must be in kcal.
Protein, carbohydrates and fats must be in grams.`

          },

          {

            type: "image_url",

            image_url: {
              url: imageUrl
            }

          }

        ]

      }

    ],


    model:
      "meta-llama/llama-4-scout-17b-16e-instruct",

    temperature: 1,

    max_completion_tokens:
      1024,

    top_p: 1,

    stream: false,

    response_format: {
      type: "json_object"
    },

    stop: null

  };


  try {

    const response =
      await fetch(
        "https://api.groq.com/openai/v1/chat/completions",
        {

          method: "POST",

          headers: {

            "Content-Type":
              "application/json",

            "Authorization":
              `Bearer ${GROQ_API_KEY}`

          },

          body:
            JSON.stringify(payload)

        }
      );


    const data =
      await response.json();


    console.log(
      "Groq Response:",
      data
    );


    if (!response.ok) {

      throw new Error(
        data.error?.message ||
        "HTTP status " +
        response.status
      );

    }


    if (
      data.choices &&
      data.choices[0]?.message?.content
    ) {

      try {

        const content =
          JSON.parse(
            data.choices[0]
              .message
              .content
          );


        if (
          content.items &&
          Array.isArray(
            content.items
          )
        ) {

          progress.style.width =
            "90%";

          return content;

        }


        throw new Error(
          "No valid items array found."
        );

      }

      catch (error) {

        throw new Error(
          "Invalid JSON response: " +
          error.message
        );

      }

    }


    throw new Error(
      "Invalid Groq API response."
    );

  }

  catch (error) {

    throw new Error(
      "Groq API error: " +
      error.message
    );

  }

}


/*
=========================================
ANALYZE BUTTON
=========================================
*/

analyzeBtn.addEventListener(
  "click",
  async () => {

    if (!selectedImage) {

      showError(
        "Please upload an image first."
      );

      return;

    }


    progressContainer.classList.remove(
      "hidden"
    );

    progress.style.width =
      "0%";


    results.innerHTML = `

      <p class="text-center text-gray-600 col-span-full">
        🔄 Analyzing your food image...
      </p>

    `;


    analyzeBtn.disabled = true;


    try {

      /*
      STEP 1
      Upload image
      */

      const imageUrl =
        await uploadToImgBB(
          selectedImage
        );


      /*
      STEP 2
      Get calorie information
      */

      const data =
        await fetchCalorieData(
          imageUrl
        );


      /*
      COMPLETE
      */

      progress.style.width =
        "100%";


      setTimeout(
        () => {

          progressContainer.classList.add(
            "hidden"
          );

          displayResults(
            data
          );

          analyzeBtn.disabled =
            false;

        },
        300
      );

    }

    catch (error) {

      progressContainer.classList.add(
        "hidden"
      );

      analyzeBtn.disabled =
        false;

      showError(
        error.message
      );

    }

  }
);


/*
=========================================
DISPLAY RESULTS
=========================================
*/

function displayResults(
  data
) {

  if (
    !data ||
    !data.items ||
    !Array.isArray(
      data.items
    ) ||
    data.items.length === 0
  ) {

    showError(
      "No food items detected in the image."
    );

    return;

  }


  results.innerHTML =
    data.items
      .map(
        (item) => `

          <div
            class="card bg-white p-6 rounded-lg shadow-lg"
          >

            <h3
              class="text-lg font-semibold text-gray-800 mb-4"
            >
              🍽️ ${escapeHTML(
                item.item_name ||
                "Unknown Food"
              )}
            </h3>


            <div class="space-y-2">

              <p class="text-gray-600">
                <strong>🔥 Calories:</strong>
                ${item.total_calories ?? "N/A"} kcal
              </p>


              <p class="text-gray-600">
                <strong>💪 Protein:</strong>
                ${item.total_protein ?? "N/A"} g
              </p>


              <p class="text-gray-600">
                <strong>🌾 Carbs:</strong>
                ${item.total_carbs ?? "N/A"} g
              </p>


              <p class="text-gray-600">
                <strong>🥑 Fat:</strong>
                ${item.total_fats ?? "N/A"} g
              </p>

            </div>

          </div>

        `
      )
      .join("");

}


/*
=========================================
ERROR MESSAGE
=========================================
*/

function showError(
  message
) {

  results.innerHTML = `

    <div
      class="bg-red-50 border border-red-200
             text-red-700 p-4 rounded-lg
             col-span-full text-center"
    >

      ❌ ${escapeHTML(message)}

    </div>

  `;

}


/*
=========================================
HTML ESCAPE
=========================================

Prevents AI-generated food names from
being inserted as raw HTML.
=========================================
*/

function escapeHTML(
  value
) {

  const div =
    document.createElement(
      "div"
    );

  div.textContent =
    String(value);

  return div.innerHTML;

}
