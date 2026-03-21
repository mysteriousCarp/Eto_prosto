export const CATEGORIES = {
    VULNS: { name: 'Уязвимости', color: '#00FF00', types: [] },
    CONTROL: { name: 'Управление', color: '#FF0000', types: [] },
    FORMATS: { name: 'Форматы', color: '#003cff', types: [] }
};

export const BLOCK_TYPES = {
    CHECK_CONTAINER: {id :'checkContainer', category: 'CONTROL'},
    // GET_RES:  {id :'get_res', category: 'CONTROL'},
    BASE_PRINT:  {id :'baseprint', category: 'FORMATS'}
};

export const getCategoryByBlockType = (blockTypeKey) => {
    const categoryKey = BLOCK_TYPES[blockTypeKey]?.category;
    return CATEGORIES[categoryKey];
};

export const BLOCKLY_DIV_ID = 'blocklyDiv'