package com.medtrack.controller;

import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.RequestMapping;

/**
 * Controller to handle Single Page Application (SPA) routing.
 * Ensures that any request that is not an API call or a static file
 * is forwarded to index.html so React Router can handle it.
 */
@Controller
public class SpaController {

    @RequestMapping(value = {
        "/", 
        "/{path:[^\\.]*}", 
        "/**/{path:[^\\.]*}"
    })
    public String forward() {
        return "forward:/index.html";
    }
}
