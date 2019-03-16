const jfNode      = require('../src/Node');
const jfTestsUnit = require('@jf/tests/src/type/Unit');
const LENGTH      = 5;
const PROPS       = ['data', 'id', 'previous', 'next', 'value'];
const values      = [0, 1, '', 'abc', {}, { a : 1 }, [], [0, 1]];
/**
 * Pruebas unitarias de la clase `jf.Node`.
 */
module.exports = class jfNodeTest extends jfTestsUnit
{
    /**
     * @override
     */
    static get title()
    {
        return 'jf.Node';
    }

    /**
     * @override
     */
    constructor(...args)
    {
        super(...args);
        this.data  = this.__buildData();
        this.nodes = this.__buildNodes(this.data, 'after')
    }

    __buildData(length = LENGTH)
    {
        return Array.from({ length }).map(() => Math.random());
    }

    __buildNodes(data, method = '')
    {
        const _nodes = data.map(value => new jfNode({ data : value }));
        if (method === 'after')
        {
            _nodes.forEach((node, index) => index && node.after(_nodes[index - 1]));
        }
        else if (method === 'before')
        {
            for (let _index = LENGTH - 1; _index; --_index)
            {
                _nodes[_index - 1].before(_nodes[_index]);
            }
        }
        return _nodes;
    }

    testConstructor()
    {
        const _config = {};
        PROPS.forEach(name => _config[name] = Math.random());
        const _sut = new jfNode(_config);
        PROPS.forEach(name => this._assert('', _sut[name], _config[name]));
    }

    testAfter()
    {
        const _data = this.data;
        // Comprobamos aquellos que no tienen next.
        let _nodes  = this.nodes;
        // Valores que no son nodos para verificar que no afecten el resultado ni falle el método.
        _nodes.forEach((node, index) => node.after(values[index]));
        this._assert('', _data, _nodes[0].pluck());
        // Comprobamos aquellos que no tienen previous, sin eliminar el nodo.
        _nodes = this.__buildNodes(_data);
        for (let _index = LENGTH - 1; _index; --_index)
        {
            _nodes[_index].after(_nodes[_index - 1], false);
        }
        this._assert('', _data, _nodes[0].pluck());
        // Movemos el nodo teniendo next y previous.
        _nodes = this.__buildNodes(_data, 'after');
        _nodes[1].after(_nodes[2]);
        this._assert('', [_data[0], _data[2], _data[1], ..._data.slice(3)], _nodes[0].pluck());
    }

    testBefore()
    {
        const _data = this.data;
        // Comprobamos aquellos que no tienen previous.
        let _nodes  = this.__buildNodes(_data, 'before');
        // Valores que no son nodos para verificar que no afecten el resultado ni falle el método.
        _nodes.forEach((node, index) => node.before(values[index]));
        this._assert('', _data, _nodes[0].pluck());
        // Comprobamos aquellos que no tienen next, sin eliminar el nodo.
        _nodes = this.__buildNodes(_data);
        _nodes.forEach((node, index) => index < LENGTH - 1 && node.before(_nodes[index + 1], false));
        this._assert('', _data, _nodes[0].pluck());
        // Movemos el nodo teniendo next y previous.
        _nodes = this.__buildNodes(_data, 'before');
        _nodes[2].before(_nodes[1]);
        this._assert('', [_data[0], _data[2], _data[1], ..._data.slice(3)], _nodes[0].pluck());
    }

    testClone()
    {
        const _nodes = this.nodes;
        this._assert('', _nodes, _nodes.map(n => n.clone()));
    }

    testDump()
    {
        const _config = {};
        PROPS.forEach(name => _config[name] = Math.random());
        const _node  = new jfNode(_config);
        const _log   = console.log;
        let _called  = 0;
        const _count = 10;
        let _length  = _count;
        console.log  = (text, id, name, value) =>
        {
            this._assert('', text, '%s | %s | %s');
            this._assert('', id, _config.id.toFixed(0).padStart(4, '0'));
            this._assert('', name, _node.constructor.name.padEnd(_length, ' '));
            this._assert('', value, _config.value);
            ++_called;
        };
        _node.dump();
        while (_length)
        {
            _node.dump(_length);
            --_length;
        }
        console.log = _log;
        this._assert('', _called, _count + 1);
    }

    testFilterUntilWhile()
    {
        const _data  = this.data;
        const _nodes = this.nodes;
        const _first = _data[0];
        const _last  = _data[LENGTH - 1];
        for (let _i = 0; _i < LENGTH; ++_i)
        {
            this._assert('', _nodes[_i].filter(node => node.data !== _last, 'next'), _nodes.slice(_i, LENGTH - 1));
            this._assert('', _nodes[_i].until(_last), _nodes.slice(_i + 1));
            this._assert('', _nodes[_i].until(_last, 'next', 'data'), _nodes.slice(_i + 1, LENGTH - 1));
            this._assert('', _nodes[_i].while(null), _nodes.slice(_i + 1));
            this._assert('', _nodes[_i].while(-1), []);
            this._assert('', _nodes[_i].while(-1, 'next', 'data'), []);
            if (_nodes[_i + 1])
            {
                const _next = _nodes[_i + 1].data;
                this._assert('', _nodes[_i].until(_next, 'next', 'data'), []);
                this._assert('', _nodes[_i].while(_next, 'next', 'data'), [_nodes[_i + 1]]);
            }
        }
        for (let _i = LENGTH - 1; _i >= 0; --_i)
        {
            this._assert('', _nodes[_i].filter(node => node.data !== _first, 'previous'), _nodes.slice(1, _i + 1));
            this._assert('', _nodes[_i].until(_first, 'previous', 'data'), _nodes.slice(1, _i));
            this._assert('', _nodes[_i].while(-1, 'previous', 'data'), []);
            if (_i)
            {
                const _previous = _nodes[_i - 1].data;
                this._assert('', _nodes[_i].until(_previous, 'previous', 'data'), []);
                this._assert('', _nodes[_i].while(_previous, 'previous', 'data'), [_nodes[_i - 1]]);
            }
        }
        //------------------------------------------------------------------------------
        // Verificamos que si no se pasa una función, no falla y devuelve un array vacío.
        //------------------------------------------------------------------------------
        this._assert('', _nodes[0].filter(null), []);
    }

    testFind()
    {
        const _data  = this.data;
        const _nodes = this.nodes;
        _nodes.forEach((node, index) => node.value = LENGTH - index);
        // Iteración hacia adelante sobre las propiedades data (por defecto) y value
        _data.forEach(
            (value, index) =>
            {
                this._assert('', _nodes[index], _nodes[0].find(value));
                this._assert('', _nodes[index], _nodes[0].find(value, 'next'));
                this._assert('', _nodes[index], _nodes[0].find(LENGTH - index, 'next', 'value'));
            }
        );
        // Iteración hacia atrás sobre las propiedades data (por defecto) y value
        _data.forEach(
            (value, index) =>
            {
                this._assert('', _nodes[index], _nodes[LENGTH - 1].find(value, 'previous'));
                this._assert('', _nodes[index], _nodes[LENGTH - 1].find(LENGTH - index, 'previous', 'value'));
            }
        );
    }

    testLookup()
    {
        const _nodes = this.nodes;
        // Buscamos el primer nodo de la secuencia.
        _nodes.forEach(node => this._assert('', node.lookup(), _nodes[0]));
        // Buscamos el último nodo de la secuencia.
        _nodes.forEach(node => this._assert('', node.lookup('next'), _nodes[LENGTH - 1]));
    }

    testRemove()
    {
        const _data  = this.data;
        const _nodes = this.nodes;
        // Eliminamos el último que no tiene next
        // Eliminamos el del medio que tiene previous y next.
        // Eliminamos el primero que no tiene previous
        [_data.length - 1, Math.floor(LENGTH / 2), 0].forEach(
            index =>
            {
                _nodes[index].remove();
                _nodes.splice(index, 1);
                _data.splice(index, 1);
                this._assert('', _data, _nodes[0].pluck());
            }
        );
    }

    testReplace()
    {
        const _data1    = this.data;
        const _data2    = this.__buildData();
        const _nodes1   = this.nodes;
        const _nodes2   = this.__buildNodes(_data2, 'after');
        const _expected = [..._data1];
        const _second   = _nodes1[1];
        //------------------------------------------------------------------------------
        // Reemplazamos los nodos primero, intermedio y último.
        //------------------------------------------------------------------------------
        for (const _index of [0, Math.floor(LENGTH / 2), LENGTH - 1])
        {
            _expected[_index] = _data2[_index];
            const _this       = _nodes2[_index].replace(_nodes1[_index]);
            this._assert('', _this, _nodes2[_index]);
            this._assert('', _second.previous.pluck('data'), _expected);
        }
        //------------------------------------------------------------------------------
        // Verificamos que no falle si queremos reemplazar un nodo suelto
        //------------------------------------------------------------------------------
        const _node = new jfNode();
        const _this = _nodes2[0].replace(_node);
        this._assert('', _this, _nodes2[0]);
        this._assert('', _nodes2[0].pluck('data'), _expected);
    }

    testSetProperties()
    {
        const _node = new jfNode();
        //------------------------------------------------------------------------------
        // No debería fallar si no se pasa ningún parámetro o diversos tipos de datos.
        //------------------------------------------------------------------------------
        _node.setProperties();
        values.forEach(value => _node.setProperties(value));
        //------------------------------------------------------------------------------
        // Las propiedades que no existen en la instancia no deberían asignarse.
        //------------------------------------------------------------------------------
        const _props = Array.from({ length : 10 }).map((value, index) => String.fromCharCode(index));
        let _values  = {};
        _props.forEach((name, index) => _values[name] = index);
        _node.setProperties(_values);
        _props.forEach(name => this._assert('', _node[name], undefined));
        //------------------------------------------------------------------------------
        // Asignación de propiedades válidas.
        //------------------------------------------------------------------------------
        let _value = Math.random();
        _node.setProperties({ data : _value });
        this._assert('', _node.data, _value);
        _value = Math.random();
        _node.setProperties({ value : _value });
        this._assert('', _node.value, _value);
        //------------------------------------------------------------------------------
        // Omisión de valores undefined
        //------------------------------------------------------------------------------
        _node.setProperties({ value : undefined });
        this._assert('', _node.value, _value);
    }

    testToArray()
    {
        // Da igual el nodo donde se empiece, se tiene que devolver toda la secuencia ordenada.
        this.nodes.forEach(
            node => this._assert('', node.toArray().map(node => node.data), this.data)
        );
    }

    testToJson()
    {
        //------------------------------------------------------------------------------
        // Agregamos propiedades privadas y protegidas para verificar que no se serialicen.
        //------------------------------------------------------------------------------
        class jfNodeTest extends jfNode
        {
            constructor(config)
            {
                super(config);
                this.array      = [...config.array];
                this.node       = new jfNode(_subnode);
                this._protected = 'protected';
                this.__private  = 'private';
                this.array.push(new jfNode(_subnode));
            }
        }

        //------------------------------------------------------------------------------
        const _subnode  = {
            data  : Math.random(),
            id    : Math.random(),
            value : Math.random()
        };
        const _expected = {
            array : [1, 2, 3],
            node  : _subnode
        };
        PROPS
            .filter(p => p !== 'previous' && p !== 'next')
            .forEach(name => _expected[name] = Math.random());
        const _sut = new jfNodeTest(_expected);
        _expected.array.push(_subnode);
        this._assert('', _sut.toJSON(), _expected);
    }

    testToString()
    {
        const _config = {};
        PROPS.forEach(name => _config[name] = Math.random());
        const _node = new jfNode(_config);
        this._assert('', JSON.stringify(_node, null, 4), _node.toString());
    }
};
