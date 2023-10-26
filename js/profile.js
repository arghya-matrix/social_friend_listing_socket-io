const socket = io("http://localhost:3000");

function getConversation(button) {
  const userId = button.getAttribute("data-user-id");
  const name = button.getAttribute("data-user-name");
  const sender_name = button.getAttribute("data-sender-name");
  const sender_id = button.getAttribute("data-sender-id");
  window.location.href = `index.html?friend_id=${userId}&name=${name}&sender_name=${sender_name}&sender_id=${sender_id}`;
}

const settings  = document.getElementsByClassName('settings')
function getSettings(){
  
}

const userIdToName = {};
const jwt = sessionStorage.getItem("jwtToken");
const details = document.getElementById("details");
const params = new URLSearchParams(window.location.search);
const username = params.get("username");
const Name = params.get("Name");
const userId = params.get("user_id");
const welcomeMessage = document.getElementById("welcome-message");
welcomeMessage.textContent = `Welcome ${Name}!!!!`;
let status = null;

async function fetchConversationData() {
  const res = await fetch("http://localhost:3000/user/chat-listing", {
    method: "GET",
    headers: {
      Authorization: `Bearer ${jwt}`,
    },
  });
  if (res.status == 401) {
    details.innerHTML += `<p><strong> Log In to fetch data</strong></p>`;
  }
  const data = await res.json();
  const users = data.data;

  users.forEach((user) => {
    userIdToName[user.user_id] = user.Name;
  });

  socket.on("status", (meta) => {
    users.forEach((user) => {
      const markUp = `<li>${user.Name}</li>`;
      const user_id = user.user_id;
      const button = `<button data-user-id="${user.user_id}" data-user-name="${user.Name}" data-sender-name="${Name}" data-sender-id="${userId}" onclick="getConversation(this)" formaction="/index.html" class="btn">Get Conversation</button>`;
      if (meta.user_id.includes(user_id)) {
        document
          .querySelector("ul")
          .insertAdjacentHTML("beforeend", markUp + "Online" + button);
      } else {
        document
          .querySelector("ul")
          .insertAdjacentHTML("beforeend", markUp + "Offline" + button);
      }
    });
  });

  return users;
}

document.addEventListener("DOMContentLoaded", function () {
  socket.emit("online", userId);
  fetchConversationData();
});

socket.on("new-message", (data) => {
  const senderName = userIdToName[data.user_id];
  const ul = document.querySelector("ul");

  // Find the existing list item for the sender
  const listItems = ul.getElementsByTagName("li");
  let existingListItem = null;

  for (const listItem of listItems) {
    if (listItem.textContent.includes(senderName)) {
      existingListItem = listItem;
      break;
    }
  }

  if (existingListItem) {
    existingListItem.textContent = `${senderName} (New message)`;
  } else {
    const listItem = document.createElement("li");
    listItem.textContent = `${senderName} (New message)`;
    ul.appendChild(listItem);
  }
});

socket.on("new-image", (data) => {
  const senderName = userIdToName[data.user_id];
  const ul = document.querySelector("ul");
  const listItems = ul.getElementsByTagName("li");
  let existingListItem = null;
  for (const listItem of listItems) {
    if (listItem.textContent.includes(senderName)) {
      existingListItem = listItem;
      break;
    }
  }
  if (existingListItem) {
    existingListItem.textContent = `${senderName} (New message)`;
  } else {
    const listItem = document.createElement("li");
    listItem.textContent = `${senderName} (New message)`;
    ul.appendChild(listItem);
  }
});
