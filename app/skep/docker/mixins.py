class ImageParser:
    def parse_image(self, spec):
        if spec is None:
            return {}

        if '@' not in spec:
            organization_repository, _, tag = spec.partition(':')
        else:
            image, _, __ = spec.rpartition('@')
            organization_repository, ___, tag = image.rpartition(':')

        if '/' in organization_repository:
            organization, _, repository = organization_repository.partition('/')
        else:
            organization = 'library'
            repository = organization_repository

        return {
            'organization': organization,
            'repository': repository,
            'tag': tag
        }
