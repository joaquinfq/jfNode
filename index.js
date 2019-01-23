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
     * @param {object} config Configuración a aplicar a la instancia.
     */
    constructor(config = {})
    {
        /**
         * Metadatos almacenados en el nodo.
         *
         * @property data
         * @type     {*}
         */
        this.data = null;
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
        this.setProperties(config);
    }

    /**
     * Inserta el nodo actual después del nodo especificado.
     *
     * @param {jf.Node} node Nodo siguiente.
     * @param {boolean} remove Si es `true` el nodo primero se elimina de la lista actual y luego se agrega.
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
    }

    /**
     * Inserta el nodo actual antes del nodo especificado.
     *
     * @param {jf.Node} node   Nodo siguiente.
     * @param {boolean} remove Si es `true` el nodo primero se elimina de la lista actual y luego se agrega.
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
     */
    dump()
    {
        console.log(JSON.stringify(this, null, 4));
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
     * Coloca en la lista de salida el valor de una propiedad del nodo.
     *
     * AVISO: Este método es recursivo, si hay muchos nodos seguramente agote la memoria o
     * si ocurre un ciclo.
     *
     * @param {array}  output   Lista de salida.
     * @param {string} property Nombre de la propiedad a extraer.
     */
    pluck(output, property = 'data')
    {
        output.push(this[property]);
        const _next = this.next;
        if (_next)
        {
            _next.pluck(output);
        }
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
     * Elimina el nodo actual.
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
    }

    /**
     * Busca todos los nodos inmediatos con el valor especificado.
     *
     * @param {string} value    Valor a buscar.
     * @param {string} iterate  Propiedad del nodo sobre la que se iterará.
     * @param {string} property Propiedad que tiene el valor a buscar.
     *
     * @return {jf.Node[]} Listado de nodos encontrados.
     */
    siblings(value, iterate = 'next', property = 'data')
    {
        const _nodes = [];
        let _node = this[iterate];
        while (_node instanceof jfNode && _node[property] === value)
        {
            _nodes[iterate === 'next' ? 'push' : 'unshift'](_node);
            _node = _node[iterate];
        }

        return _nodes;
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
            .forEach(property => _data[property] = this[property]);

        return _data;
    }
}

module.exports = jfNode;
