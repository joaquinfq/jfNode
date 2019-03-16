let counter = 1;

/**
 * Representa un nodo de datos en una lista encadenada.
 *
 * @namespace jf
 * @class     jf.Node
 */
class jfNode
{
    /**
     * Constructor de la clase.
     *
     * @param {object|null} config Configuración a aplicar a la instancia.
     */
    constructor(config = null)
    {
        /**
         * Metadatos almacenados en el nodo.
         *
         * @property data
         * @type     {*}
         */
        this.data = null;
        /**
         * Identificador del nodo.
         *
         * @property id
         * @type     {Number}
         */
        this.id = counter++;
        /**
         * Nodo anterior.
         *
         * @property previous
         * @type     {jf.Node|null}
         */
        this.previous = null;
        /**
         * Nodo siguiente.
         *
         * @property next
         * @type     {jf.Node|null}
         */
        this.next = null;
        /**
         * Valor del nodo.
         *
         * @property value
         * @type     {*}
         */
        this.value = null;
        //------------------------------------------------------------------------------
        if (config)
        {
            this.setProperties(config);
        }
    }

    /**
     * Inserta el nodo actual después del nodo especificado.
     *
     * @param {jf.Node} node Nodo siguiente.
     * @param {boolean} remove Si es `true` el nodo primero se elimina de la lista actual y luego se agrega.
     *
     * @return {jf.Node} Nodo actual.
     */
    after(node, remove = true)
    {
        if (node instanceof jfNode)
        {
            if (remove)
            {
                this.remove();
            }
            const _next = node.next;
            if (_next)
            {
                _next.previous = this;
                this.next      = _next;
            }
            node.next     = this;
            this.previous = node;
        }

        return this;
    }

    /**
     * Inserta el nodo actual antes del nodo especificado.
     *
     * @param {jf.Node} node   Nodo siguiente.
     * @param {boolean} remove Si es `true` el nodo primero se elimina de la lista actual y luego se agrega.
     *
     * @return {jf.Node} Nodo actual.
     */
    before(node, remove = true)
    {
        if (node instanceof jfNode)
        {
            if (remove)
            {
                this.remove();
            }
            const _previous = node.previous;
            if (_previous)
            {
                _previous.next = this;
            }
            node.previous = this;
            this.previous = _previous;
            this.next     = node;
        }

        return this;
    }

    /**
     * Clona el nodo actual y devuelve una copia.
     *
     * @return {jf.Node} Clon del nodo.
     */
    clone()
    {
        const _clone = new this.constructor();
        _clone.setProperties(this);

        return _clone;
    }

    /**
     * Realiza un volcado por pantalla del nodo para inspeccionaarlo.
     *
     * @param {number} length Longitud del nombre de la clase del nodo.
     */
    dump(length = 10)
    {
        console.log(
            '%s | %s | %s',
            this.id.toFixed(0).padStart(4, '0'),
            this.getName().padEnd(length, ' '),
            this.value
        );
    }

    /**
     * Encuentra el nodo con el valor especificado permitiendo ir hacia adelante
     * o hacia atrás.
     *
     * @param {string}  value    Valor a buscar.
     * @param {string}  iterate  Propiedad del nodo sobre la que se iterará.
     * @param {string}  property Propiedad que tiene el valor a buscar.
     *
     * @return {jf.Node|null} Nodo con el valor o `null` si no se encontró.
     */
    find(value, iterate = 'next', property = 'data')
    {
        let _node = this;
        while (_node instanceof jfNode && _node[property] !== value)
        {
            _node = _node[iterate];
        }

        return _node;
    }

    /**
     * Devuelve todos los nodos para los cuales la función devuelve `true`.
     * La función recibe como primer parámetro el nodo y como segundo el índice.
     *
     * @param {function} fn      Función a llamar para cada nodo encontrado.
     * @param {string}   iterate Propiedad del nodo sobre la que se iterará.
     *
     * @return {Node[]} Listado de nodos encontrados.
     */
    filter(fn, iterate = 'next')
    {
        const _nodes = [];
        if (typeof fn === 'function')
        {
            let _node  = this;
            let _index = 0;
            while (_node instanceof jfNode)
            {
                if (fn(_node, _index++))
                {
                    _nodes[iterate === 'next' ? 'push' : 'unshift'](_node);
                    _node = _node[iterate];
                }
                else
                {
                    break;
                }
            }
        }

        return _nodes;
    }

    /**
     * Devuelve el nombre del nodo.
     *
     * @return {string} Nombre del nodo.
     */
    getName()
    {
        return this.constructor.name;
    }

    /**
     * Encuentra el primer node de la secuencia que no contiene la propiedad buscada o el
     * valor de la propiedad no es un nodo.
     *
     * @param {string} property Propiedad que tiene el valor a buscar.
     *
     * @return {jf.Node} Primer nodo de la secuencia.
     */
    lookup(property = 'previous')
    {
        let _node = this;
        while (_node instanceof jfNode)
        {
            if (property in _node && _node[property] instanceof jfNode)
            {
                _node = _node[property];
            }
            else
            {
                break;
            }
        }

        return _node;
    }

    /**
     * Devuelve un listado con el valor de la propiedad en la secuencia actual y a partir del nodo actual.
     *
     * @param {string} property Nombre de la propiedad a extraer.
     *
     * @return {array} Valores extraídos.
     */
    pluck(property = 'data')
    {
        const _output = [];
        let _node     = this;
        while (_node)
        {
            _output.push(_node[property]);
            _node = _node.next;
        }

        return _output;
    }

    /**
     * Elimina el nodo actual.
     *
     * @return {jf.Node} Nodo actual.
     */
    remove()
    {
        const _previous = this.previous;
        const _next     = this.next;
        if (_previous instanceof jfNode)
        {
            _previous.next = _next;
            this.previous  = null;
        }
        if (_next instanceof jfNode)
        {
            _next.previous = _previous;
            this.next      = null;
        }

        return this;
    }

    /**
     * Reemplaza el nodo especificado por el nodo actual.
     * Si el nodo a reemplazar no pertenece a una cadena, no pasa nada.
     *
     * @param {jf.Node} node Nodo a reemplazar.
     *
     * @return {jf.Node} Nodo actual.
     */
    replace(node)
    {
        const _previous = node.previous;
        const _next     = node.next;
        if (_previous instanceof jfNode)
        {
            node.remove();
            this.after(_previous);
        }
        else if (_next instanceof jfNode)
        {
            node.remove();
            this.before(_next);
        }

        return this;
    }

    /**
     * Asigna los valores a las propiedades de la instancia.
     *
     * @param {object} values Valores a asignar.
     */
    setProperties(values)
    {
        if (values)
        {
            Object.keys(values).forEach(
                property =>
                {
                    if (property in this)
                    {
                        const _value = values[property];
                        if (_value !== undefined)
                        {
                            this[property] = _value;
                        }
                    }
                }
            );
        }
    }

    /**
     * Convierte la secuencia de nodos en un array.
     *
     * @return {jf.Node[]} Listado de nodos.
     */
    toArray()
    {
        const _nodes = [];
        let _node    = this.previous;
        while (_node)
        {
            _nodes.unshift(_node);
            _node = _node.previous;
        }
        _node = this;
        while (_node)
        {
            _nodes.push(_node);
            _node = _node.next;
        }

        return _nodes;
    }

    /**
     * @override
     */
    toJSON()
    {
        const _data = {};
        Object.keys(this)
            .sort()
            // Devolvemos todas las propiedades menos los 2 nodos y cualquiera que se haya agregado como privada.
            .filter(property => property[0] !== '_' && property !== 'previous' && property !== 'next')
            .forEach(
                property =>
                {
                    let _value = this[property];
                    if (_value instanceof jfNode)
                    {
                        _value = _value.toJSON();
                    }
                    if (Array.isArray(_value))
                    {
                        _value.forEach(
                            (value, index) =>
                            {
                                if (value instanceof jfNode)
                                {
                                    _value[index] = value.toJSON();
                                }
                            }
                        );
                    }
                    _data[property] = _value;
                }
            );

        return _data;
    }

    /**
     * @override
     */
    toString()
    {
        return JSON.stringify(this, null, 4);
    }

    /**
     * Devuelve todos los nodos existentes hasta el nodo que tiene el valor buscado sin incluir el nodo actual.
     *
     * @param {string} value    Valor a buscar.
     * @param {string} iterate  Propiedad del nodo sobre la que se iterará.
     * @param {string} property Propiedad que tiene el valor a buscar.
     *
     * @return {Node[]} Listado de nodos encontrados.
     */
    until(value, iterate = 'next', property = 'value')
    {
        const _node = this[iterate];

        return _node instanceof jfNode
            ? _node.filter(node => node[property] !== value, iterate)
            : [];
    }

    /**
     * Devuelve todos los nodos inmediatos con el valor especificado sin incluir el nodo actual.
     *
     * @param {string} value    Valor a buscar.
     * @param {string} iterate  Propiedad del nodo sobre la que se iterará.
     * @param {string} property Propiedad que tiene el valor a buscar.
     *
     * @return {Node[]} Listado de nodos encontrados.
     */
    while(value, iterate = 'next', property = 'value')
    {
        const _node = this[iterate];

        return _node instanceof jfNode
            ? _node.filter(node => node[property] === value, iterate)
            : [];
    }
}

module.exports = jfNode;
