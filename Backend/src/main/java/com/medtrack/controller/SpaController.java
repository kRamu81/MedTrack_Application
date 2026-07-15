package com.medtrack.controller;

import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.RequestMapping;

/**
 * Controller responsible for handling Single Page Application (SPA) routing.
 * <p>
 * Requests that do not target API endpoints or static resources are
 * forwarded to {@code index.html}, allowing the React Router to
 * handle client-side navigation.
 */
@Controller
public class SpaController {

    /**
     * Forwards non-API and non-static resource requests to the SPA entry point.
     *
     * @return a forward instruction to {@code index.html}
     */
    @RequestMapping(value = {
            "/",
            "/{path:[^\\.]*}",
            "/**/{path:[^\\.]*}"
    })
    public String forward() {
        return "forward:/index.html";
    }
}