import sys
import threading
from pathlib import Path

import pytest

sys.path.insert(0, str(Path(__file__).resolve().parents[1]))

import server  # noqa: E402


@pytest.fixture
def live():
    srv = server.make_server("127.0.0.1", 0)
    thread = threading.Thread(target=srv.serve_forever, daemon=True)
    thread.start()
    host, port = srv.server_address
    yield srv, f"http://{host}:{port}", (host, port)
    srv.shutdown()
    srv.server_close()
