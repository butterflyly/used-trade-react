package com.example.demo.Service.Chat;

import com.example.demo.DTO.Alram.ChatNotificationEvent;
import com.example.demo.DTO.Chat.Request.ChatMessageRequest;
import com.example.demo.DTO.Chat.Response.ChatMessageResponse;
import com.example.demo.Entity.Chat.ChatMessage;
import com.example.demo.Entity.Chat.ChatRoom;
import com.example.demo.Entity.Users.Users;
import com.example.demo.Error.BusinessException;
import com.example.demo.Repository.Chat.ChatMessage.ChatMessageRepository;
import com.example.demo.Repository.Chat.ChatRoom.ChatRoomRepository;
import com.example.demo.Repository.Users.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
@Transactional
public class ChatMessageCommandService {

    private final ChatMessageRepository chatMessageRepository;
    private final ChatRoomRepository chatRoomRepository;
    private final UserRepository userRepository;
    private final ApplicationEventPublisher eventPublisher; // 스프링 내장 확성기

    public ChatMessageResponse saveMessage(ChatMessageRequest chatMessageRequest, String username) {
        ChatRoom room = chatRoomRepository.findById(chatMessageRequest.roomId())
                .orElseThrow(() -> new BusinessException("존재하지 않는 채팅방입니다."));
        Users sender = userRepository.findByUsernameAndDeletedFalse(username).
                orElseThrow(() -> new BusinessException("유저가 존재하지 않습니다."));

        Users receiver = room.getPartner(username);

        if (receiver.getId().equals(0L)) {
            throw new BusinessException("상대방이 탈퇴한 회원이므로 메시지를 보낼 수 없습니다.");
        }

        // 채팅방 참여 여부 및 퇴장 여부 확인
        if (room.getBuyer().getUsername().equals(username)) {
            if (room.isBuyerLeft()) {
                throw new BusinessException("퇴장한 채팅방에서는 메시지를 보낼 수 없습니다.");
            }
        } else if (room.getSeller().getUsername().equals(username)) {
            if (room.isSellerLeft()) {
                throw new BusinessException("퇴장한 채팅방에서는 메시지를 보낼 수 없습니다.");
            }
        } else {
            throw new BusinessException("해당 채팅방의 참여자가 아닙니다.");
        }

        ChatMessage message = ChatMessage.builder()
                .chatRoom(room)
                .sender(sender)
                .content(chatMessageRequest.content())
                .senderNickname(sender.getNickname())
                .type(chatMessageRequest.type()) // TALK 혹은 IMAGE 저장
                .isRead(false)
                .build();

        chatMessageRepository.save(message);

        String targetUrl = "/service/chat/room/" + room.getId();

        eventPublisher.publishEvent(new ChatNotificationEvent(receiver.getId(), sender.getNickname(), targetUrl));

        return ChatMessageResponse.of(message, username);
    }

    // 읽음 로직
    public void markMessagesAsRead(Long roomId, String loginUsername) {
        // 이 방의 메시지 중, 내가 보낸 것이 아니고(상대방이 보낸 것), 아직 안 읽은 것들만 업데이트
        chatMessageRepository.markAsReadWithQuerydsl(roomId, loginUsername);
    }
}
