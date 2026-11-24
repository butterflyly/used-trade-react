package com.example.demo.Repository.Users;

import com.example.demo.Entity.Users.QUsers;
import com.example.demo.Entity.Users.UserRole;
import com.example.demo.Entity.Users.Users;
import com.querydsl.core.types.dsl.BooleanExpression;
import com.querydsl.jpa.impl.JPAQuery;
import com.querydsl.jpa.impl.JPAQueryFactory;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.support.PageableExecutionUtils;

import java.util.List;

@RequiredArgsConstructor
public class UserRepositoryImpl implements UserRepositoryCustom {

    private final JPAQueryFactory jpaQueryFactory;

    @Override
    public Page<Users> findAdminTargetUsers(
            String filterType, String keyword, String preserved, Pageable pageable) {

        QUsers qUsers = QUsers.users;

        List<Users> content = jpaQueryFactory
                .selectFrom(qUsers)
                .where(
                        getFilterExpression(filterType, qUsers),
                        getPreservedExpression(filterType, preserved, qUsers),
                        containsKeyword(keyword, qUsers)
                )
                .orderBy(qUsers.id.desc())
                .offset(pageable.getOffset())
                .limit(pageable.getPageSize())
                .fetch();

        JPAQuery<Long> countQuery = jpaQueryFactory
                .select(qUsers.count())
                .from(qUsers)
                .where(
                        getFilterExpression(filterType, qUsers),
                        getPreservedExpression(filterType, preserved, qUsers),
                        containsKeyword(keyword, qUsers)
                );

        return PageableExecutionUtils.getPage(
                content, pageable, countQuery::fetchOne
        );
    }

    /**
     * 필터 타입에 따른 회원 조회 조건
     */
    private BooleanExpression getFilterExpression(String filterType, QUsers qUsers) {

        if ("BLACK".equalsIgnoreCase(filterType)) {
            return qUsers.role.eq(UserRole.Black)
                    .and(qUsers.deleted.isFalse());
        }

        if ("DELETED".equalsIgnoreCase(filterType)) {
            return qUsers.deleted.isTrue();
        }

        return qUsers.role.eq(UserRole.Black)
                .or(qUsers.deleted.isTrue());
    }

    /**
     * 소프트 삭제 회원의 영구 보존 여부 조건
     */
    private BooleanExpression getPreservedExpression(
            String filterType, String preserved, QUsers qUsers) {

        // 소프트 삭제 탭이 아니거나 전체 조회라면 조건 없음
        if (!"DELETED".equalsIgnoreCase(filterType)
                || "ALL".equalsIgnoreCase(preserved)) {
            return null;
        }

        if ("TRUE".equalsIgnoreCase(preserved)) {
            return qUsers.isPermanentPreserved.isTrue();
        }

        if ("FALSE".equalsIgnoreCase(preserved)) {
            return qUsers.isPermanentPreserved.isFalse();
        }

        return null;
    }

    /**
     * 키워드 검색
     */
    private BooleanExpression containsKeyword(String keyword, QUsers qUsers) {

        if (keyword == null || keyword.trim().isEmpty()) {
            return null;
        }

        return qUsers.username.contains(keyword)
                .or(qUsers.nickname.contains(keyword))
                .or(qUsers.email.contains(keyword));
    }
}