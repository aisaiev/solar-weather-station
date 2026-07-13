#pragma once

namespace ota_ui {

inline constexpr const char *kPageHtml = R"HTML(
<!doctype html>
<html lang="en">
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>Solar Weather Station OTA</title>
    <style>
        :root {
            --bg: #f2efe8;
            --surface: #fff9ef;
            --ink: #1d1d1d;
            --muted: #5f5a53;
            --accent: #0e7c5d;
            --danger: #b4372f;
            --danger-deep: #8e261f;
            --border: #d8cdb9;
        }

        * { box-sizing: border-box; }

        body {
            margin: 0;
            min-height: 100vh;
            display: grid;
            place-items: center;
            background:
                radial-gradient(circle at 20% 10%, #fffef8 0%, transparent 35%),
                radial-gradient(circle at 80% 90%, #f9e6cf 0%, transparent 45%),
                var(--bg);
            color: var(--ink);
            font-family: "Avenir Next", "Trebuchet MS", "Segoe UI", sans-serif;
            padding: 20px;
        }

        .card {
            width: min(560px, 100%);
            background: var(--surface);
            border: 1px solid var(--border);
            border-radius: 18px;
            box-shadow: 0 10px 30px rgba(0, 0, 0, 0.08);
            padding: 24px;
        }

        h1 {
            margin: 0 0 8px;
            font-size: 1.7rem;
            line-height: 1.2;
        }

        p {
            margin: 0;
            color: var(--muted);
        }

        .actions {
            margin-top: 22px;
            display: flex;
            flex-wrap: wrap;
            gap: 12px;
        }

        a,
        button {
            appearance: none;
            border: none;
            border-radius: 12px;
            font: inherit;
            cursor: pointer;
            padding: 12px 16px;
            text-decoration: none;
            font-weight: 700;
            transition: transform 120ms ease, opacity 120ms ease;
        }

        a:active,
        button:active { transform: translateY(1px); }

        .update {
            background: var(--accent);
            color: #ffffff;
        }

        .reboot {
            background: var(--danger);
            color: #ffffff;
        }

        .reboot:hover { background: var(--danger-deep); }

        .note {
            margin-top: 14px;
            font-size: 0.92rem;
            color: var(--muted);
        }
    </style>
</head>
<body>
    <main class="card">
        <h1>OTA Maintenance</h1>
        <p>Use this page to update firmware, reset the mesh node, or reboot the station.</p>

        <div class="actions">
            <a class="update" href="/update">Open OTA Update</a>
            <form action="/reset-mesh" method="post" onsubmit="return confirm('Reset Meshtastic node now?');">
                <button class="reboot" type="submit">Reset Meshtastic Node</button>
            </form>
            <form action="/reboot" method="post" onsubmit="return confirm('Reboot device now?');">
                <button class="reboot" type="submit">Reboot Device</button>
            </form>
        </div>
    </main>
</body>
</html>
)HTML";

} // namespace ota_ui
