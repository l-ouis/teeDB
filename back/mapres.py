class Mapres:
    def __init__(self, image_path: str, automapper_path: str, author: str, tags: list[str]):
        self.image_path = image_path
        self.automapper_path = automapper_path
        self.author = author
        self.tags = tags

    def __repr__(self):
        return (f"ImageResource(image_path={self.image_path}, "
                f"automapper_path={self.automapper_path}, "
                f"author={self.author}, tags={self.tags})")