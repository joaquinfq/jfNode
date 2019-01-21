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
     * @param {*}       data     Datos a almacenar en el nodo.
     * @param {jf.Node} previous Nodo anterior al actual.
     * @param {jf.Node} next     Nodo siguiente al actual.
     */
    constructor(data = null, previous = null, next = null)
    {
        /**
         * Datos almacenados en el nodo.
         *
         * @property data
         * @type     {*}
         */
        this.data = data;
        /**
         * Nodo anterior.
         *
         * @property previous
         * @type     {jf.Node|null}
         */
        this.previous = previous;
        /**
         * Nodo siguiente.
         *
         * @property next
         * @type     {jf.Node|null}
         */
        this.next = next;
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
     * @return {jf.jfNode} Clon del nodo.
     */
    clone()
    {
        const _clone = new this.constructor();
        Object.assign(_clone, this);

        return _clone;
    }

    /**
     * Coloca en la lista de salida el valor del nodo.
     *
     * AVISO: Este método es recursivo, si hay muchos nodos seguramente agote la memoria o
     * si ocurre un ciclo.
     *
     * @param {array} output Lista de salida.
     */
    concat(output)
    {
        output.push(this.data);
        const _next = this.next;
        if (_next)
        {
            _next.concat(output);
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
        return this.data;
    }
}
module.exports = jfNode;
