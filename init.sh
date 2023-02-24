rm -rf /tmp/.X0-lock &
export DISPLAY=:0.0
startx -- :0 &
x11vnc -forever -shared -display :0 2>&1 &
./noVNC/utils/launch.sh &
cd ../../social-robot-new/client-bot/
node client.js && supervisord &