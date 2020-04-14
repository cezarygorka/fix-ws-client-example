import { useEffect } from 'react';

export default function Websocket({ service, onMessage, onOpen, onError, onClose }) {
  useEffect(() => {
    if (service) {
      service.fixpWebsocket.onopen = () => {
        onOpen();
      };

      service.fixpWebsocket.onerror = () => {
        onError();
      };

      service.fixpWebsocket.onclose = (event) => {
        onClose(event);
      };

      service.fixpWebsocket.onmessage = ({ data }) => {
        onMessage(JSON.parse(data));
      }
    }
  });

  return null;
}
