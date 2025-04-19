export class TreeNode {
    constructor({ type, value = null, children = [], whitespace = [], meta = {} }) {
        this.id = TreeNode.generateId();
        this.type = type;
        this.value = value;
        this.children = children;
        this.meta = meta;
        this.whitespace = whitespace;
    }

    addChild(child) {
        this.children.push(child);
    }
    setChildren(children) {
        this.children = children;
    }
    print(indent = 0) {
        const prefix = '  '.repeat(indent);
        console.log(`${prefix}${this.type}${this.value ? `: ${this.value}` : ''}`);
        for (const child of this.children) {
            child.print(indent + 1);
        }
    }
    markDirty() {
        this.meta.dirty = true;
    }
    static generateId() {
        return (++TreeNode._idCounter).toString();
    }
}
TreeNode._idCounter = 0;

export function tokenize(code) {
    let tokens = [];
    const regex = /\/\*[\s\S]*?\*\/|\/\/.*|\s+|function|\{|\}|"[^"]*"|\w+|./g;
    let match;
    while ((match = regex.exec(code)) !== null) {
        const value = match[0];
        if (/^\/\//.test(value)) {
            tokens.push({ type: 'comment', subtype: 'line', value });
        } else if (/^\/\*/.test(value)) {
            tokens.push({ type: 'comment', subtype: 'block', value });
        } else if (/^\s+$/.test(value)) {
            tokens.push({ type: 'whitespace', value });
        } else {
            tokens.push({ type: 'token', value });
        }
    }
    return tokens;
}

export function parseFileToTree(to_parse) {
    let position = 0;

    function peek() {
        return to_parse[position];
    }
    function next() {
        return to_parse[position++];
    }

    function consumeWhitespace() {
        let ws = '';
        while (peek() && peek().type === 'whitespace') {
            ws += next().value;
        }
        return ws;
    }

    function parseProgram() {
        const children = [];
        let extra = [];
        while (position < to_parse.length) {
            const whitespace = consumeWhitespace();
            const tokenObj = peek();
            if (!tokenObj) break;
            let child = null;

            if (tokenObj.type === 'comment') {
                if (extra.length) {
                    children.push(new TreeNode({ type: 'Extra', value: extra, whitespace: [''] }));
                    extra = [];
                }
                child = new TreeNode({ type: 'Comment', value: tokenObj.value, whitespace: [whitespace], meta: { subtype: tokenObj.subtype } });
                position++;
            } else if (tokenObj.value === 'function') {
                if (extra.length) {
                    children.push(new TreeNode({ type: 'Extra', value: extra, whitespace: [''] }));
                    extra = [];
                }
                child = parseFunction(whitespace);
            } else if (tokenObj.value === '{') {
                if (extra.length) {
                    children.push(new TreeNode({ type: 'Extra', value: extra, whitespace: [''] }));
                    extra = [];
                }
                child = parseBlock(whitespace);
            } else {
                extra.push(whitespace + tokenObj.value);
                position++;
            }

            if (child) {
                children.push(child);
            }
        }

        if (extra.length) {
            children.push(new TreeNode({ type: 'Extra', value: extra, whitespace: [''] }));
        }
        return new TreeNode({ type: 'File', children });
    }

    function parseFunction(leadingWhitespace = '') {
        const children = [];
        next(); // eat 'function'
        let extra = [];
        while (position < to_parse.length) {
            const whitespace = consumeWhitespace();
            const tokenObj = peek();
            if (!tokenObj) break;
            let child = null;

            if (tokenObj.type === 'comment') {
                if (extra.length) {
                    children.push(new TreeNode({ type: 'Extra', value: extra, whitespace: [''] }));
                    extra = [];
                }
                child = new TreeNode({ type: 'Comment', value: tokenObj.value, whitespace: [whitespace], meta: { subtype: tokenObj.subtype } });
                position++;
            } else if (tokenObj.value === '{') {
                if (extra.length) {
                    children.push(new TreeNode({ type: 'Extra', value: extra, whitespace: [''] }));
                    extra = [];
                }
                child = parseBlock(whitespace);
            } else if (tokenObj.value === '}') {
                break; // function body should close via block
            } else {
                extra.push(whitespace + tokenObj.value);
                position++;
            }

            if (child) {
                children.push(child);
            }
        }
        if (extra.length) {
            children.push(new TreeNode({ type: 'Extra', value: extra, whitespace: [''] }));
        }
        return new TreeNode({ type: 'Function', value: 'function', children, whitespace: [leadingWhitespace] });
    }

    function parseBlock(leadingWhitespace = '') {
        const children = [];
        next(); // eat '{'
        let extra = [];
        while (position < to_parse.length && peek()?.value !== '}') {
            const whitespace = consumeWhitespace();
            const tokenObj = peek();
            if (!tokenObj) break;
            let child = null;

            if (tokenObj.type === 'comment') {
                if (extra.length) {
                    children.push(new TreeNode({ type: 'Extra', value: extra, whitespace: [''] }));
                    extra = [];
                }
                child = new TreeNode({ type: 'Comment', value: tokenObj.value, whitespace: [whitespace], meta: { subtype: tokenObj.subtype } });
                position++;
            } else if (tokenObj.value === '{') {
                if (extra.length) {
                    children.push(new TreeNode({ type: 'Extra', value: extra, whitespace: [''] }));
                    extra = [];
                }
                child = parseBlock(whitespace);
            } else if (tokenObj.value === 'function') {
                if (extra.length) {
                    children.push(new TreeNode({ type: 'Extra', value: extra, whitespace: [''] }));
                    extra = [];
                }
                child = parseFunction(whitespace);
            } else {
                extra.push(whitespace + tokenObj.value);
                position++;
            }

            if (child) {
                children.push(child);
            }
        }
        if (peek()?.value === '}') {
            position++;
        }
        if (extra.length) {
            children.push(new TreeNode({ type: 'Extra', value: extra, whitespace: [''] }));
        }
        return new TreeNode({ type: 'Block', value: '{}', children, whitespace: [leadingWhitespace] });
    }

    return parseProgram();
}

export function markDirtyTrees(oldTree, newTree) {
    function markDirtyNodes(oldNode, newNode) {
        if (!oldNode || !newNode) return;
        if (oldNode.type !== newNode.type || oldNode.value !== newNode.value) {
            newNode.markDirty();
        }
        let minLen = Math.min(oldNode.children.length, newNode.children.length);
        for (let i = 0; i < minLen; i++) {
            markDirtyNodes(oldNode.children[i], newNode.children[i]);
        }
        if (oldNode.children.length !== newTree.children.length) {
            for (let i = minLen; i < newTree.children.length; i++) {
                newTree.children[i].markDirty();
            }
        }
    }
    markDirtyNodes(oldTree, newTree);
}

export function mergeTrees(oldNode, newNode) {
    if (newNode.meta?.dirty) {
        return newNode;
    }
    if (oldNode.type !== newNode.type || oldNode.value !== newNode.value) {
        return newNode;
    }
    const mergedChildren = [];
    const count = Math.min(oldNode.children.length, newNode.children.length);
    for (let i = 0; i < count; i++) {
        mergedChildren.push(mergeTrees(oldNode.children[i], newNode.children[i]));
    }
    for (let i = count; i < newNode.children.length; i++) {
        mergedChildren.push(newNode.children[i]);
    }
    return new TreeNode({ type: oldNode.type, value: oldNode.value, children: mergedChildren, meta: { ...oldNode.meta, ...newNode.meta } });
}

export function convertTreeToString(tree) {
    function nodeToString(node) {
        let str = '';
        if (node.whitespace?.length) {
            str += node.whitespace[0];
        }
        switch (node.type) {
            case 'File':
                break;
            case 'Function':
                str += 'function';
                break;
            case 'Block':
                str += '{';
                break;
            case 'Comment':
                str += node.value;
                return str;
            case 'Extra':
                for (let token of node.value) {
                    str += token;
                }
                return str;
        }
        for (let child of node.children) {
            str += nodeToString(child);
        }
        return str;
    }
    return nodeToString(tree);
}