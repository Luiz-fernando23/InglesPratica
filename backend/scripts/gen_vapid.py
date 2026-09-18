"""Gera um par de chaves VAPID (EC P-256) para Web Push.

Uso:
    python scripts/gen_vapid.py
    # ou dentro do container:
    # docker compose exec backend python /app/scripts/gen_vapid.py

Cole a saída no backend/.env (local) ou nas env vars do provedor (produção).
"""
import base64


def main() -> None:
    try:
        from cryptography.hazmat.primitives.asymmetric import ec

        private_key = ec.generate_private_key(ec.SECP256R1())
        num = private_key.private_numbers()
        priv = num.private_value.to_bytes(32, "big")
        pub = b"\x04" + num.public_numbers.x.to_bytes(32, "big") + num.public_numbers.y.to_bytes(32, "big")
    except ImportError:
        from ecdsa import SigningKey, NIST256p  # type: ignore

        sk = SigningKey.generate(curve=NIST256p)
        priv = sk.to_string()
        pub = b"\x04" + sk.get_verifying_key().to_string()

    def b64(b: bytes) -> str:
        return base64.urlsafe_b64encode(b).decode().rstrip("=")

    print(f"VAPID_PRIVATE_KEY={b64(priv)}")
    print(f"VAPID_PUBLIC_KEY={b64(pub)}")


if __name__ == "__main__":
    main()
