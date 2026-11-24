package io.github.theodoremeyer.simplevoicegeyser.core.server.servlets;

import io.github.theodoremeyer.simplevoicegeyser.core.SvgCore;
import io.github.theodoremeyer.simplevoicegeyser.core.update.ContributorsCache;
import jakarta.servlet.http.HttpServlet;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.json.JSONObject;

import java.io.IOException;
import java.nio.charset.StandardCharsets;

/**
 * Public JSON for the optional join-page GitHub contributors showcase.
 */
public final class ContributorsServlet extends HttpServlet {

    public ContributorsServlet() {}

    @Override
    protected void doGet(HttpServletRequest req, HttpServletResponse resp) throws IOException {
        if (!Boolean.TRUE.equals(SvgCore.getConfig().WEB_SHOW_CONTRIBUTORS.get())) {
            JSONObject disabled = new JSONObject();
            disabled.put("enabled", false);
            disabled.put("contributors", new org.json.JSONArray());
            writeJson(resp, disabled, HttpServletResponse.SC_OK);
            return;
        }

        boolean force = "1".equals(req.getParameter("refresh"))
                || "true".equalsIgnoreCase(req.getParameter("refresh"));
        JSONObject payload = ContributorsCache.getPayload(force);
        JSONObject out = new JSONObject(payload.toString());
        out.put("enabled", true);
        writeJson(resp, out, HttpServletResponse.SC_OK);
    }

    private static void writeJson(HttpServletResponse resp, JSONObject json, int status) throws IOException {
        byte[] body = json.toString().getBytes(StandardCharsets.UTF_8);
        resp.setStatus(status);
        resp.setCharacterEncoding(StandardCharsets.UTF_8.name());
        resp.setContentType("application/json; charset=UTF-8");
        // Browser may cache briefly; server cache is the real TTL.
        resp.setHeader("Cache-Control", "public, max-age=300");
        resp.setContentLength(body.length);
        resp.getOutputStream().write(body);
    }
}
