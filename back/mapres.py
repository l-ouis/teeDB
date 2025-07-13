class Mapres:
    def __init__(
            self,
            name: str,
            image_path: str,
            automapper_path: str,
            example_path: list[str],
            author: str,
            tags: list[str],
            last_modified: int = None):
        self.name = name
        self.image_path = image_path
        self.automapper_path = automapper_path
        self.example_path = example_path
        self.author = author
        self.tags = tags
        self.last_modified = last_modified
    def to_dict(self):
        return {
            "name": self.name,
            "image_path": self.image_path,
            "automapper_path": self.automapper_path,
            "example_path": self.example_path,
            "author": self.author,
            "tags": self.tags,
            "last_modified": self.last_modified,
        }