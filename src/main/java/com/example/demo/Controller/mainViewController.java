package com.example.demo.Controller;

import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;

@Controller
public class mainViewController {

    // /service 로 시작하고, 뒤에 확장자(css, js 등)가 없는 모든 요청을 index.html로 포워딩
    @GetMapping(value = {"/service", "/service/**"})
    public String forward() {
        return "forward:/index.html";
    }

    @GetMapping("/")
    public String mainView()
    {
        return "redirect:/items/list/1";
    }


}
