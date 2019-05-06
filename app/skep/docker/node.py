class Node:
    def __init__(self, node):
        self.node = node

    def as_json(self):
        return self.node.attrs
