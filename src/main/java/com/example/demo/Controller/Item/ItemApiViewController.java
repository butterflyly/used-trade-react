package com.example.demo.Controller.Item;

import com.example.demo.DTO.item.Request.ItemCreateRequest;
import com.example.demo.DTO.item.Response.ItemDetailResponse;
import com.example.demo.DTO.item.Response.ItemSummaryResponse;
import com.example.demo.Entity.Item.ItemCategory;
import com.example.demo.Entity.Item.ItemStatus;
import com.example.demo.Error.BusinessException;
import com.example.demo.Service.Item.ItemCategoryService;
import com.example.demo.Service.Item.ItemReadService;
import com.example.demo.Service.Users.UserReadService;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/view/items")
public class ItemApiViewController {

    private final ItemReadService itemReadService;
    private final ItemCategoryService itemCategoryService;
    private final UserReadService userReadService;

    @GetMapping("/create-form")
    public ResponseEntity<?> itemCreate(
            @RequestParam(value = "categoryId", required = false) Long categoryId,
            @AuthenticationPrincipal UserDetails userDetails
    ) {
        // 1. 작성 권한 검증
        userReadService.validateItemCreatePermission(userDetails.getUsername());

        // 2. 카테고리 목록 조회
        List<ItemCategory> categories = itemCategoryService.findAll();

        // 3. 리액트로 보낼 데이터를 Map에 키-값 형태로 적재
        Map<String, Object> responseData = new HashMap<>();
        responseData.put("categories", categories);
        responseData.put("selectedCategoryId", categoryId != null ? categoryId : "");
        responseData.put("itemCreateForm", new ItemCreateRequest("", 0, "", null, null));

        // 4. Map 자체를 200 OK와 함께 JSON으로 리턴
        return ResponseEntity.ok(responseData);
    }

    @GetMapping("/list/{categoryId}")
    public ResponseEntity<?> list(@PathVariable Long categoryId,
                       @RequestParam(defaultValue = "0") int page,
                       @RequestParam(defaultValue = "latest") String sort,
                 //      @RequestParam(value = "status",defaultValue = "ON_SALE") ItemStatus status,
                       @RequestParam(value = "kw", defaultValue = "") String kw // 검색
            , @RequestParam(value = "searchType", defaultValue = "title") String type)
    {
        //  1. 프론트 정렬 키워드("latest", "views" 등)를 JPA Sort 객체로 변환
        Sort sortOption = getSortOption(sort);

        //  2. Pageable 객체 완성 (20개씩 페이징 + 정렬 포함)
        Pageable pageable = PageRequest.of(page, 20, sortOption);

        //  3. 완성된 pageable 만 깔끔하게 서비스로 전달
        Page<ItemSummaryResponse> itemList = itemReadService.getList(kw, categoryId, pageable, type);

        Map<String, Object> responseData = new HashMap<>();
        responseData.put("categories", itemCategoryService.findAll());
        responseData.put("items",itemList);
        responseData.put("currentCategoryId", categoryId);
        responseData.put("categoryName",categoryId != null ?
                itemCategoryService.findByCategory(categoryId).getName() : null);

        return ResponseEntity.ok(responseData);
    }

    private Sort getSortOption(String sort) {
        if (sort == null) {
            return Sort.by(Sort.Direction.DESC, "createdAt").and(Sort.by(Sort.Direction.DESC, "id"));
        }

        return switch (sort) {
            case "views" -> Sort.by(Sort.Direction.DESC, "viewCount").and(Sort.by(Sort.Direction.DESC, "id"));
            case "priceAsc" -> Sort.by(Sort.Direction.ASC, "price").and(Sort.by(Sort.Direction.DESC, "id"));
            case "priceDesc" -> Sort.by(Sort.Direction.DESC, "price").and(Sort.by(Sort.Direction.DESC, "id"));
            default -> Sort.by(Sort.Direction.DESC, "createdAt").and(Sort.by(Sort.Direction.DESC, "id")); // "latest"
        };
    }

    @GetMapping("/detail/{id}")
    public ResponseEntity<ItemDetailResponse> itemDetail(@PathVariable Long id,
                                                         @AuthenticationPrincipal UserDetails userDetails, HttpServletRequest httpServletRequest)
    {
        String username = (userDetails != null) ? userDetails.getUsername() : "";

        // 2. 서비스 호출 및 모델 담기
        // 상세 조회 DTO(ItemDetailResponse)에는 title, content, isOwner 등이 포함됨
        ItemDetailResponse detail = itemReadService.getDetailWithViews(id, username,httpServletRequest);

        return ResponseEntity.ok(detail);
    }

    @GetMapping("/edit/{id}")
    public ResponseEntity<?> editForm(@PathVariable Long id,
                           @AuthenticationPrincipal UserDetails userDetails,
                           Model model) {

        ItemDetailResponse detail = itemReadService.getDetail(id, userDetails.getUsername());

        if (!detail.isOwner()) {
            throw new BusinessException("본인이 작성한 글만 수정할 수 있습니다.");
        }

        Map<String, Object> responseData = new HashMap<>();
        responseData.put("item", detail);
        responseData.put("categories", itemCategoryService.findAll());

        return ResponseEntity.ok(responseData);
    }
}
