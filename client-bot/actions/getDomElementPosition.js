"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
function getDomElementPosition(io, elementSelector) {
    io.emit('client_msg_element_info_position', elementSelector);
}
exports.getDomElementPosition = getDomElementPosition;
