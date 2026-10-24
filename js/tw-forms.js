/* Thandiwe - Formspree AJAX submit for all site forms.
   Any <form> whose action points at formspree.io is handled here:
   it posts in the background, shows an inline status message and
   keeps the visitor on the page. If this script fails to load, the
   forms still work as a normal POST to Formspree (graceful fallback). */
(function () {
    "use strict";

    function statusEl(form) {
        var el = form.querySelector(".tw-form-status");
        if (!el) {
            el = document.createElement("div");
            el.className = "tw-form-status";
            el.setAttribute("role", "status");
            el.setAttribute("aria-live", "polite");
            form.appendChild(el);
        }
        return el;
    }

    function show(form, ok, msg) {
        var el = statusEl(form);
        el.className = "tw-form-status " + (ok ? "ok" : "err");
        el.textContent = msg;
        el.hidden = false;
    }

    document.addEventListener("submit", function (e) {
        var form = e.target;
        if (!(form instanceof HTMLFormElement)) return;
        if (!/formspree\.io/.test(form.getAttribute("action") || "")) return;

        e.preventDefault();

        var btn = form.querySelector("[type=submit]");
        var isNewsletter = form.classList.contains("tw-newsletter");
        if (btn) {
            btn.disabled = true;
            if (!isNewsletter) {
                btn.dataset.twLabel = btn.innerHTML;
                btn.innerHTML = "Sending…";
            }
        }

        fetch(form.action, {
            method: "POST",
            body: new FormData(form),
            headers: { "Accept": "application/json" }
        }).then(function (res) {
            if (res.ok) {
                show(form, true, form.getAttribute("data-success") ||
                    "Thank you. Your submission has been received.");
                form.reset();
            } else {
                return res.json().then(function (data) {
                    var msg = (data && data.errors && data.errors.length)
                        ? data.errors.map(function (x) { return x.message; }).join(" ")
                        : "Sorry, something went wrong. Please email info@thandiwe.org.za.";
                    show(form, false, msg);
                });
            }
        }).catch(function () {
            show(form, false,
                "Network error. Please try again, or email info@thandiwe.org.za.");
        }).finally(function () {
            if (btn) {
                btn.disabled = false;
                if (btn.dataset.twLabel) { btn.innerHTML = btn.dataset.twLabel; }
            }
        });
    });
})();
