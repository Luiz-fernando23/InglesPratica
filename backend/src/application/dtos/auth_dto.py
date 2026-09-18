from dataclasses import dataclass

@dataclass
class RegisterInput:
    name: str
    email: str
    password: str

@dataclass
class LoginInput:
    email: str
    password: str

@dataclass
class TokenOutput:
    access_token: str
    refresh_token: str
    token_type: str = "bearer"
