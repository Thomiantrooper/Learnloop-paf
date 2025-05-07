// src/services/WebSocketService.js
import SockJS from "sockjs-client";
import { CompatClient, Stomp } from "@stomp/stompjs";

let stompClient = null;
let isConnected = false;

export const connectWebSocket = (userId, callback) => {
  if (isConnected) return;

  const socket = new SockJS('http://localhost:8080/ws');
  stompClient = Stomp.over(socket); // This works with the Compat version

  stompClient.connect({}, () => {
    isConnected = true;
    console.log("WebSocket Connected");
    stompClient.subscribe(`/topic/profile-update/${userId}`, (message) => {
      const update = JSON.parse(message.body);
      callback(update);
    });
  }, (error) => {
    console.error("WebSocket Error:", error);
    isConnected = false;
  });
};

export const disconnectWebSocket = () => {
  if (stompClient && isConnected) {
    stompClient.disconnect(() => {
      console.log("WebSocket Disconnected");
      isConnected = false;
    });
  }
};
