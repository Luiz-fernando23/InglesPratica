import random

# Static lists for offline generation (no external AI dependency)
PHRASES = [
    ("Good morning, how are you today?", "Bom dia, como você está hoje?"),
    ("I would like to order a coffee, please.", "Eu gostaria de pedir um café, por favor."),
    ("Where is the nearest bus station?", "Onde fica a estação de ônibus mais próxima?"),
    ("She has been studying English for two years.", "Ela está estudando inglês há dois anos."),
    ("We should meet tomorrow at the park.", "Nós deveríamos nos encontrar amanhã no parque."),
    ("The book on the table belongs to my brother.", "O livro sobre a mesa pertence ao meu irmão."),
    ("Can you help me with this exercise?", "Você pode me ajudar com este exercício?"),
    ("It is raining, so take an umbrella.", "Está chovendo, então leve um guarda-chuva."),
    ("They traveled to New York last summer.", "Eles viajaram para Nova York no verão passado."),
    ("I have never seen such a beautiful sunset.", "Eu nunca vi um pôr do sol tão bonito."),
    ("Please close the window before leaving.", "Por favor, feche a janela antes de sair."),
    ("He always wakes up at six o'clock.", "Ele sempre acorda às seis horas."),
    ("We are planning a trip to the beach.", "Estamos planejando uma viagem para a praia."),
    ("The movie was more interesting than I expected.", "O filme foi mais interessante do que eu esperava."),
    ("Could you tell me what time it is?", "Você poderia me dizer que horas são?"),
    ("My favorite color is blue.", "Minha cor favorita é azul."),
    ("She sings beautifully in the choir.", "Ela canta lindamente no coral."),
    ("Don't forget to bring your passport.", "Não se esqueça de trazer seu passaporte."),
    ("Learning a new language takes time and dedication.", "Aprender um novo idioma leva tempo e dedicação."),
    ("The children are playing in the garden.", "As crianças estão brincando no jardim."),
    ("I need to buy some groceries for the week.", "Preciso comprar mantimentos para a semana."),
    ("He explained the problem very clearly.", "Ele explicou o problema muito claramente."),
    ("We had dinner at a nice restaurant yesterday.", "Nós jantamos em um restaurante agradável ontem."),
    ("The train leaves in ten minutes.", "O trem parte em dez minutos."),
    ("She is looking for a new job opportunity.", "Ela está procurando uma nova oportunidade de emprego."),
]

WORDS = [
    ("House", "Casa"),
    ("Book", "Livro"),
    ("Water", "Água"),
    ("Friend", "Amigo"),
    ("Time", "Tempo"),
    ("Journey", "Jornada"),
    ("Knowledge", "Conhecimento"),
    ("Freedom", "Liberdade"),
    ("Challenge", "Desafio"),
    ("Beautiful", "Bonito"),
    ("Quickly", "Rapidamente"),
    ("Apple", "Maçã"),
    ("Sunshine", "Luz do sol"),
    ("Mountain", "Montanha"),
    ("River", "Rio"),
    ("Computer", "Computador"),
    ("Language", "Idioma"),
    ("Opportunity", "Oportunidade"),
    ("Healthy", "Saudável"),
    ("Important", "Importante"),
    ("Understand", "Entender"),
    ("Together", "Juntos"),
    ("Tomorrow", "Amanhã"),
    ("Yesterday", "Ontem"),
    ("Family", "Família"),
    ("Work", "Trabalho"),
    ("Music", "Música"),
    ("Dream", "Sonho"),
    ("Strength", "Força"),
    ("Wisdom", "Sabedoria"),
]

def _normalize(s: str) -> str:
    return s.strip().lower()


def _matches_exclude(content_en: str, exclude: list[str]) -> bool:
    low = content_en.lower()
    return any(w and w.lower() in low for w in exclude)


INTERMEDIATE_WORDS = {"journey", "knowledge", "freedom", "challenge", "quickly", "opportunity", "healthy", "understand"}
ADVANCED_WORDS = {"wisdom", "strength"}

INTERMEDIATE_PHRASES = {
    "she has been studying english for two years.",
    "we should meet tomorrow at the park.",
    "the book on the table belongs to my brother.",
    "they traveled to new york last summer.",
    "i have never seen such a beautiful sunset.",
    "we are planning a trip to the beach.",
    "the movie was more interesting than i expected.",
    "learning a new language takes time and dedication.",
    "the children are playing in the garden.",
    "i need to buy some groceries for the week.",
    "he explained the problem very clearly.",
    "we had dinner at a nice restaurant yesterday.",
    "she is looking for a new job opportunity.",
}


def level_of_word(content_en: str) -> str:
    w = _normalize(content_en)
    if w in ADVANCED_WORDS:
        return "advanced"
    if w in INTERMEDIATE_WORDS:
        return "intermediate"
    return "basic"


def level_of_phrase(content_en: str) -> str:
    if _normalize(content_en) in INTERMEDIATE_PHRASES:
        return "intermediate"
    return "basic"


def _pick(
    pool: list[tuple[str, str]],
    count: int,
    allow_repeat: bool,
    exclude: list[str],
    seen: set[str],
    levels: set[str] | None = None,
    level_fn=None,
) -> tuple[list[tuple[str, str]], bool]:
    """Filtra pool por exclude + seen (se allow_repeat=False) e sorteia.

    Retorna (items, exhausted) onde exhausted=True se não havia itens novos
    suficientes para atender count.
    """
    exclude_clean = [w.strip() for w in (exclude or []) if w and w.strip()]
    seen_norm = {_normalize(s) for s in (seen or set())}
    levels = levels or set()

    candidates = [
        p for p in pool
        if not _matches_exclude(p[0], exclude_clean)
        and (allow_repeat or _normalize(p[0]) not in seen_norm)
        and (not levels or (level_fn(p[0]) if level_fn else "basic") in levels)
    ]
    if len(candidates) >= count:
        return random.sample(candidates, k=count), False
    if candidates:
        return random.sample(candidates, k=len(candidates)), True
    return [], True


def generate_phrases(
    count: int = 10,
    allow_repeat: bool = False,
    exclude: list[str] | None = None,
    seen: set[str] | None = None,
    levels: set[str] | None = None,
) -> tuple[list[tuple[str, str]], bool]:
    return _pick(PHRASES, count, allow_repeat, exclude or [], seen or set(), levels, level_of_phrase)

def generate_words(
    count: int = 10,
    allow_repeat: bool = False,
    exclude: list[str] | None = None,
    seen: set[str] | None = None,
    levels: set[str] | None = None,
) -> tuple[list[tuple[str, str]], bool]:
    return _pick(WORDS, count, allow_repeat, exclude or [], seen or set(), levels, level_of_word)
