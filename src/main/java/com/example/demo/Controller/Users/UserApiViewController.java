package com.example.demo.Controller.Users;

import com.example.demo.DTO.Chat.Response.ChatRoomSummaryResponse;
import com.example.demo.DTO.CommonResponse;
import com.example.demo.DTO.Review.ReviewResponse;
import com.example.demo.DTO.Users.Request.Auth.LoginRequest;
import com.example.demo.DTO.Users.Request.Auth.Register.UserRegisterRequest;
import com.example.demo.DTO.Users.Response.MyPageResponse;
import com.example.demo.DTO.Users.Response.UserDetailResponse;
import com.example.demo.DTO.item.Response.ItemSummaryResponse;
import com.example.demo.Service.Chat.ChatRoomReadService;
import com.example.demo.Service.Item.ItemLikeReadService;
import com.example.demo.Service.Item.ItemReadService;
import com.example.demo.Service.Review.ReviewReadService;
import com.example.demo.Service.Users.MyPageReadService;
import com.example.demo.Service.Users.UserReadService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequiredArgsConstructor
@Slf4j
@RequestMapping("/api/view/users")
public class UserApiViewController {

    private final UserReadService userReadService;
    private final ChatRoomReadService chatRoomReadService;
    private final ItemReadService itemReadService;
    private final MyPageReadService myPageReadService;
    private final ItemLikeReadService itemLikeRefindByMyLikePage;
    private final ReviewReadService reviewReadService;

    // 로그인 페이지 진입 시 필요한 초기 데이터 (시큐리티 메시지 등) 제공 API
    @GetMapping("/login-info")
    public ResponseEntity<CommonResponse<?>> getLoginInfo(
            @RequestParam(value = "message", required = false) String message
    ) {
        // 클라이언트(리액트)가 팝업이나 안내 문구를 띄울 수 있도록 데이터 전달
        Map<String, Object> data = new HashMap<>();
        data.put("message", message != null ? message : "");
        data.put("loginForm", new LoginRequest("", "", false));

        return ResponseEntity.ok(new CommonResponse<>(true, "로그인 정보 조회 성공", data));
    }

    // 마이페이지 화면
    @GetMapping("/mypage")
    public ResponseEntity<MyPageResponse> myPage(
            @AuthenticationPrincipal UserDetails userDetails,
            @PageableDefault(size = 5) Pageable pageable
    ) {
        MyPageResponse myPageData = myPageReadService.getMyPageData(userDetails.getUsername(), pageable);

        // 메시지 없이 데이터 자체를 곧바로 200 OK로 리턴!
        return ResponseEntity.ok(myPageData);
    }

    // 내 판매글 전체보기
    @GetMapping("/items/my-list")
    public ResponseEntity<?> getMyItemsPage(
            @AuthenticationPrincipal UserDetails userDetails,
            @RequestParam(defaultValue = "0") int page
    ) {

        Pageable pageable = PageRequest.of(page, 10, Sort.by("createdAt").descending());
        Page<ItemSummaryResponse> items = itemReadService.getItemsByUsername(userDetails.getUsername(), pageable);

        Map<String, Object> responseData = new HashMap<>();
        responseData.put("items", items);
        responseData.put("pageTitle", "내 판매글 목록");

        return ResponseEntity.ok(responseData);
    }

    // 내 구매 내역 전체보기
    @GetMapping("/items/my-buy-list")
    public ResponseEntity<?> getMyBuyItemsPage(
            @AuthenticationPrincipal UserDetails userDetails,
            @RequestParam(defaultValue = "0") int page) {

        Pageable pageable = PageRequest.of(page, 10, Sort.by("createdAt").descending());
        Page<ItemSummaryResponse> items = itemReadService.getBoughtItemsByUsername(userDetails.getUsername(), pageable);

        Map<String, Object> responseData = new HashMap<>();
        responseData.put("items", items);
        responseData.put("pageTitle", "내 구매 내역");

        return ResponseEntity.ok(responseData);
    }

    // 내 찜 목록 전체보기
    @GetMapping("/items/my-like-list")
    public ResponseEntity<Page<ItemSummaryResponse>> getMyLikeItemsPage(
            @AuthenticationPrincipal UserDetails userDetails,
            @RequestParam(defaultValue = "0") int page) {

        Pageable pageable = PageRequest.of(page, 10, Sort.by("createdAt").descending());
        Page<ItemSummaryResponse> items = itemLikeRefindByMyLikePage.getLikedItemsByUsernameList(userDetails.getUsername(), pageable);

        return ResponseEntity.ok(items);
    }

    // 내 채팅 전체보기 (구매/판매 구분)
    @GetMapping("/mypage/chats")
    public ResponseEntity<Page<ChatRoomSummaryResponse>> getMyChatRooms(
            @AuthenticationPrincipal UserDetails userDetails,
            @RequestParam(defaultValue = "BUYER") String role,
            @RequestParam(defaultValue = "0") int page) {

        Page<ChatRoomSummaryResponse> chatList =
                chatRoomReadService.getChatRooms(userDetails.getUsername(), role, page, 10);

        return ResponseEntity.ok(chatList);
    }

    // 내가 쓴 후기 전체보기
    @GetMapping("/reviews/written")
    public ResponseEntity<Page<ReviewResponse>> getMyWrittenReviews(
            @AuthenticationPrincipal UserDetails userDetails,
            @RequestParam(defaultValue = "0") int page,
            Model model) {

        Pageable pageable = PageRequest.of(page, 10, Sort.by("createdAt").descending());
        Page<ReviewResponse> reviews = reviewReadService.getWrittenReviews(userDetails.getUsername(), pageable);


        return ResponseEntity.ok(reviews);
    }

    // 내가 받은 후기 전체보기
    @GetMapping("/reviews/received")
    public ResponseEntity<Page<ReviewResponse>> getMyReceivedReviews(
            @AuthenticationPrincipal UserDetails userDetails,
            @RequestParam(defaultValue = "0") int page
          ) {

        Pageable pageable = PageRequest.of(page, 10, Sort.by("createdAt").descending());
        Page<ReviewResponse> reviews = reviewReadService.getReceivedReviews(userDetails.getUsername(), pageable);

        return ResponseEntity.ok(reviews);
    }

    // 회원 정보 수정 페이지 이동
    @GetMapping("/update")
    public ResponseEntity<UserDetailResponse> updatePage(@AuthenticationPrincipal UserDetails userDetails) {

        return ResponseEntity.ok(userReadService.getUserResponseDTO(userDetails.getUsername()));
    }
}
