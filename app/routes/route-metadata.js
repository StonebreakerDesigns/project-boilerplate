const metadataDecorator = options => {
	return cls => {
		cls.metadata = options;
		return cls;
	};
};
export default metadataDecorator;