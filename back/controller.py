import os
import pickle
from mapres import Mapres
import time

class FileSystemDB:
    def __init__(self, root_name="root"):
        self.root_name = root_name
        self.mapres_dict = {}
        self.initialize_directory()
    
    def initialize_directory(self):
        if not os.path.exists(self.root_name):
            os.makedirs(self.root_name)
        mapres_path = os.path.join(self.root_name, "mapres_dict.pkl")
        if os.path.exists(mapres_path):
            with open(mapres_path, "rb") as f:
                self.mapres_dict = pickle.load(f)

    def create_mapres(self, files: dict):
        mapres_name = files["name"]
        author = files["author"]
        tags = files["tags"]
        if mapres_name in self.mapres_dict:
            return
        mapres_dir = os.path.join(self.root_name, mapres_name)
        os.makedirs(mapres_dir, exist_ok=True)
        
        # Handle variant paths
        variant_paths = []
        if files.get("variants"):
            for i, variant in enumerate(files["variants"]):
                variant_filename = f"{mapres_name}_variant_{i+1}.png"
                variant_path = os.path.join(mapres_dir, variant_filename)
                variant_paths.append(variant_path)
                with open(variant_path, "wb") as f:
                    f.write(variant["content"])
        
        mapres = Mapres(
            name=mapres_name,
            image_path=os.path.join(mapres_dir, files["main"]["filename"]),
            automapper_path=os.path.join(mapres_dir, files["rules"]["filename"]) if files.get("rules") else None,
            example_path=os.path.join(mapres_dir, files["example"]["filename"]) if files.get("example") else None,
            author=author,
            tags=tags,
            variant_paths=variant_paths,
            last_modified=int(time.time())
        )
        self.mapres_dict[mapres_name] = mapres
        with open(os.path.join(mapres_dir, files["main"]["filename"]), "wb") as f:
            f.write(files["main"]["content"])
        if files.get("rules"):
            with open(os.path.join(mapres_dir, files["rules"]["filename"]), "wb") as f:
                f.write(files["rules"]["content"])
        if files.get("example"):
            with open(os.path.join(mapres_dir, files["example"]["filename"]), "wb") as f:
                f.write(files["example"]["content"])

        self.save_mapres()
    
    def delete_mapres(self, mapres_name: str):
        if mapres_name in self.mapres_dict:
            del self.mapres_dict[mapres_name]
            mapres_dir = os.path.join(self.root_name, mapres_name)
            if os.path.exists(mapres_dir):
                for file in os.listdir(mapres_dir):
                    os.remove(os.path.join(mapres_dir, file))
                os.rmdir(mapres_dir)
            self.save_mapres()
    
    def save_mapres(self):
        mapres_path = os.path.join(self.root_name, "mapres_dict.pkl")
        with open(mapres_path, "wb") as f:
            pickle.dump(self.mapres_dict, f)
