"""
Статистикийн (QR уншуулалт / товч дарсан) event бvртгэхэд ашиглагдах туслах
функцvvд: хэрэглэгчийн IP хаяг, User-Agent-аас төхөөрөмж/browser болон
ойролцоо байршлыг тодорхойлно.

Байршил тодорхойлохдоо гуравдагч талын ФРИ IP-geolocation API (ipapi.co)
ашигладаг тул:
  - Локал/дотоод сvлжээнд ажиллаж байхад (127.0.0.1, 192.168.x.x гэх мэт)
    байршил олдохгvй тул `None` буцаана — энэ хэвийн явдал.
  - Deploy хийсний дараа (Render гэх мэт) бодит нийтийн IP ирдэг тул
    байршил тодорхойлогдож эхэлнэ.
  - Хайлт амжилтгvй болсон ч (сvлжээгvй, quota дууссан гэх мэт) энэ нь
    ХЭЗЭЭ Ч tracking endpoint-ийг унагаахгvй — зөвхөн location талбар хоосон
    vлдэнэ.
"""

from typing import Optional, Tuple
from fastapi import Request

try:
    import httpx
except ImportError:  # httpx суулгаагvй байсан ч апп унахгvй
    httpx = None

_PRIVATE_PREFIXES = ("127.", "10.", "192.168.", "::1", "localhost")


def _is_private_ip(ip: str) -> bool:
    if not ip:
        return True
    if ip.startswith(_PRIVATE_PREFIXES):
        return True
    if ip.startswith("172."):
        try:
            second = int(ip.split(".")[1])
            if 16 <= second <= 31:
                return True
        except (IndexError, ValueError):
            pass
    return False


def get_client_ip(request: Request) -> Optional[str]:
    """
    Render/Vercel зэрэг proxy-ийн ард ажиллаж байгаа тул эхлээд
    X-Forwarded-For header-ийг шалгаж, байхгvй бол шууд холболтын IP-г авна.
    """
    forwarded = request.headers.get("x-forwarded-for")
    if forwarded:
        # "client, proxy1, proxy2" хэлбэртэй тул эхний утга нь жинхэнэ клиент
        return forwarded.split(",")[0].strip()
    if request.client:
        return request.client.host
    return None


def parse_user_agent(user_agent: str) -> Tuple[Optional[str], Optional[str]]:
    """User-Agent мөрөнд суурилсан энгийн (dependency-гvй) задлалт."""
    if not user_agent:
        return None, None

    ua = user_agent.lower()

    if "iphone" in ua:
        device = "iPhone"
    elif "ipad" in ua:
        device = "iPad"
    elif "android" in ua:
        device = "Android"
    elif "macintosh" in ua or "mac os" in ua:
        device = "Mac"
    elif "windows" in ua:
        device = "Windows"
    elif "linux" in ua:
        device = "Linux"
    else:
        device = "Тодорхойгvй"

    if "edg/" in ua:
        browser = "Edge"
    elif "opr/" in ua or "opera" in ua:
        browser = "Opera"
    elif "chrome/" in ua and "chromium" not in ua:
        browser = "Chrome"
    elif "crios" in ua:
        browser = "Chrome (iOS)"
    elif "fxios" in ua:
        browser = "Firefox (iOS)"
    elif "firefox/" in ua:
        browser = "Firefox"
    elif "safari/" in ua and "chrome/" not in ua:
        browser = "Safari"
    else:
        browser = "Тодорхойгvй"

    return device, browser


def get_location_from_ip(ip: Optional[str]) -> Optional[str]:
    """Локал IP эсвэл сvлжээ/API алдаатай тохиолдолд `None` буцаана."""
    if not ip or _is_private_ip(ip) or httpx is None:
        return None

    try:
        with httpx.Client(timeout=2.0) as client:
            res = client.get(f"https://ipapi.co/{ip}/json/")
            if res.status_code != 200:
                return None
            data = res.json()
            city = data.get("city")
            country = data.get("country_name")
            parts = [p for p in [city, country] if p]
            return ", ".join(parts) if parts else None
    except Exception:
        return None
