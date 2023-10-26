document.addEventListener("DOMContentLoaded", () => {
  const socket = io("http://localhost:3000");

  const messageContainer = document.querySelector(".container");
  const fileInput = document.getElementById("fileInput");
  const messageInput = document.getElementById("messageInp");

  const modal = document.getElementById("myModal");
  const modalImg = document.getElementById("img01");

  const span = document.getElementsByClassName("close")[0];
  span.onclick = function () {
    modal.style.display = "none";
  };

  const append = (message, position) => {
    const messageElement = document.createElement("div");
    messageElement.innerText = message;
    messageElement.classList.add("message");
    messageElement.classList.add(position);
    messageContainer.append(messageElement);
  };

  const jwt = sessionStorage.getItem("jwtToken");
  const params = new URLSearchParams(window.location.search);
  const friend_id = params.get("friend_id");
  const friend_name = params.get("name");
  const sender_name = params.get("sender_name");
  const user_id = params.get("sender_id");

  socket.emit("online", user_id);

  socket.on("user-joined", (sender_name) => {
    append(`${sender_name} joined the chat`, "middle");
  });

  socket.on("receive", (data) => {
    if (data.sender_name != sender_name) {
      append(`${data.sender_name} : ${data.message}`, "left");
    }
    scrollToBottom();
  });

  socket.on("left-chat", () => {
    append(`${friend_name} left the chat`, "middle");
  });

  socket.on("imageURL", (data) => {
    const imageContainer = document.getElementById("imageContainer");
    console.log(data, "<----Url of the image");
    const imgElement = document.createElement("img");
    imgElement.classList.add("myimg");
    imgElement.src = data.imageUrl;
    imgElement.id = "myimg_" + Date.now();

    imgElement.onload = () => {
      console.log("Image loaded successfully.");
      console.log("Image loaded successfully.");
      const messageContainer = document.createElement("div"); // Create a container for the image
      messageContainer.classList.add("message");

      if (data.sender_name === sender_name) {
        messageContainer.classList.add("right");
        append(`You :`, "right");
      } else {
        messageContainer.classList.add("left");
        append(`${friend_name} :`, "left");
      }

      messageContainer.appendChild(imgElement); //
      imageContainer.appendChild(messageContainer);

      imgElement.onclick = function () {
        modal.style.display = "block";
        modalImg.src = this.src;
      };
      scrollToBottom();
    };

    imgElement.onerror = () => {
      console.error("Error loading image.");
    };
  });

  window.addEventListener("load", () => {
    scrollToBottom();
  });

  async function fetchConversationData() {
    const res = await fetch(
      `http://localhost:3000/user/get-conversation?friend_id=${friend_id}`,
      {
        method: "GET",
        headers: {
          Authorization: `Bearer ${jwt}`,
        },
      }
    );

    const data = await res.json();
    const convo = data.data;
    const con_id = data.con_id;
    socket.emit("private-room", con_id, sender_name);

    // Use Promises to load and append images in order
    const imageContainer = document.getElementById("imageContainer");

    for (const obj of convo) {
      if (obj.messageType === "Text" || !obj.messageType) {
        
        if (obj.myMessage === true) {
          append(`You : ${obj.message}`, "right");
        } else {
          append(`${friend_name} : ${obj.message}`, "left");
        }
      }

      if (obj.messageType === "Image") {
        const imgElement = document.createElement("img");
        imgElement.classList.add("myimg");
        imgElement.id = "myimg_" + Date.now();
        imgElement.src = obj.message;

        await new Promise((resolve) => {
          imgElement.onload = () => {
            // console.log("Image loaded successfully.");
            const messageContainer = document.createElement("div");
            messageContainer.classList.add("message");

            if (obj.myMessage === true) {
              messageContainer.classList.add("right");
              append(`You :`, "right");
            } else {
              messageContainer.classList.add("left");
              append(`${friend_name} :`, "left");
            }

            messageContainer.appendChild(imgElement);
            imageContainer.appendChild(messageContainer);

            imgElement.onclick = function () {
              modal.style.display = "block";
              modalImg.src = this.src;
            };

            resolve(); // Resolve the promise once the image has loaded
            scrollToBottom();
          };

          imgElement.onerror = () => {
            console.error("Error loading image.");
            resolve(); // Resolve the promise even if there's an error
          };
        });
      }
    }
    return con_id;
  }

  function scrollToBottom() {
    const container = document.querySelector(".container");
    container.scrollTop = container.scrollHeight;
  }

  fetchConversationData().then((con_id) => {
    document
      .getElementById("send-container")
      .addEventListener("submit", async function (event) {
        event.preventDefault();
        const file = fileInput.files[0];
        const message = messageInput.value;
        if (message) {
          socket.emit("send", sender_name, user_id, con_id, friend_id, message);
          messageInput.value = "";
        }
        if (file) {
          const reader = new FileReader();
          reader.onload = (e) => {
            const imageData = e.target.result;
            const type = file.type;
            console.log("File details", file.type);
            socket.emit(
              "image",
              sender_name,
              user_id,
              con_id,
              friend_id,
              imageData,
              type
            );
          };
          reader.readAsDataURL(file);
          fileInput.value = "";
        }
        socket.on("receive", (data) => {
          append(`You : ${data.message}`, "right");
        });
      });
  });
});
