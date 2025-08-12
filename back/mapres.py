class Mapres:
    def __init__(
            self,
            name: str,
            image_path: str,
            automapper_path: str,
            example_path: list[str],
            author: str,
            tags: list[str],
            variant_paths: list[str] = None,
            last_modified: int = None):
        self.name = name
        self.image_path = image_path
        self.automapper_path = automapper_path
        self.example_path = example_path
        self.author = author
        self.tags = tags
        self.variant_paths = variant_paths if variant_paths is not None else []
        self.last_modified = last_modified
    def to_dict(self):
        return {
            "name": self.name,
            "image_path": self.image_path,
            "automapper_path": self.automapper_path,
            "example_path": self.example_path,
            "author": self.author,
            "tags": self.tags,
            "variant_paths": self.variant_paths,
            "last_modified": self.last_modified,
        }