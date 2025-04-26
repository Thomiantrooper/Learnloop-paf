// src/services/WebSocketService.js
import SockJS from "sockjs-client";
import { Client } from "@stomp/stompjs";

let stompClient = null;

export const connectWebSocket = (userId, onMessageReceived) => {
  const socket = new SockJS("http://localhost:8080/ws");

  stompClient = new Client({
    webSocketFactory: () => socket,
    reconnectDelay: 5000,
    debug: (str) => {
      console.log(str);
    },
  });

  stompClient.onConnect = () => {
    console.log("Connected to WebSocket");
    stompClient.subscribe(`/topic/profile-update/${userId}`, (message) => {
      const update = JSON.parse(message.body);
      onMessageReceived(update);
    });
  };


  stompClient.onStompError = (frame) => {
    console.error("WebSocket error:", frame);
  };

  stompClient.activate();
};

export const disconnectWebSocket = () => {
  if (stompClient) {
    stompClient.deactivate();
    console.log("Disconnected from WebSocket");
  }
};