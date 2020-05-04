/**
 * @description 编辑器配置面板
 */
import React, { useContext, useCallback, useRef, useLayoutEffect } from 'react';
import storeContext from '../context';
import { searchInitStatus, Enum } from './searchStatus';

// 定义固有的样式属性配置项，后续可持续拓展（自定义属性配置项没有固有的，是根据每个组件JSON中staticProps动态渲染的）
export const initStylesItemArr = [
    { name: '宽度', styleName: 'width' },
    { name: '高度', styleName: 'height' },
    { name: '定位方式', styleName: 'position' },
    { name: '左定位', styleName: 'left' },
    { name: '右定位', styleName: 'right' },
    { name: '上定位', styleName: 'top' },
    { name: '下定位', styleName: 'bottom' },
    { name: '左外距', styleName: 'marginLeft' },
    { name: '右外距', styleName: 'marginRight' },
    { name: '上外距', styleName: 'marginTop' },
    { name: '下外距', styleName: 'marginBottom' },
    { name: '背景色', styleName: 'backgroundColor' },
    { name: '背景图', styleName: 'backgroundImage' },
    { name: '背景尺寸', styleName: 'backgroundSize' }
];

const tab = ['样式', '属性'];

const Option = () => {
    const { state, dispatch } = useContext(storeContext);
    const { tabIndex, optionArr, propsArr, choose, tree, menu } = state;
    const focusInputEl = useRef(null);      // 选中操作的输入框
    const prevInputValue = useRef(null);    // 改变输入框之前的value
    const inputSelection = useRef(null);    // 改变输入框之前的光标位置记录

    useLayoutEffect(() => {
        // 在视图更新时根据情况恢复光标的位置
        const selection = inputSelection.current;
        const input = focusInputEl.current;

        // 当前存在上次Input操作的光标位置记录
        if (selection) {
            // 如果光标的位置小于上次操作前暂存Input值的总长度，那么可以判定属于中间编辑的情况
            if (selection.start < prevInputValue.current.length) {
                input.selectionStart = selection.start;
                input.selectionEnd = selection.end;
                inputSelection.current = null;  // 清除光标位置记录
            }
            // 恢复光标位置后，重新暂存新的Input值
            prevInputValue.current = input.value;
        }
    });

    // 绑定当前在操作的输入框
    const bindFocusRef = useCallback((e) => {
        focusInputEl.current = e.target;
        prevInputValue.current = e.target.value;
    }, []);

    // 渲染面板配置列表
    const renderOption = () => {
        // 没选中组件不显示面板
        if (!choose) {
            return null;
        }
        // 样式面板
        if (tabIndex === 0) {
            return <ul className="optionBox" key={tabIndex}>
                {
                    optionArr.map(({ name, styleName, value }, i) => <li className="optionItem" key={styleName}>
                        <p>{name}</p>
                        <input value={value} onFocus={bindFocusRef} onChange={(e) => {
                            changeInputStyle(e, i, styleName);
                        }}/>
                    </li>)
                }
            </ul>;
        }
        // 属性面板
        return <ul className="optionBox" key={tabIndex}>
            {
                propsArr.map(({ name, prop, value }, i) => <li className="optionItem" key={prop}>
                    <p>{name}</p>
                    <input value={value} onFocus={bindFocusRef} onChange={(e) => {
                        changeInputStyle(e, i, prop);
                    }}/>
                </li>)
            }
        </ul>;
    };

    // 改变面板属性值的回调
    const changeInputStyle = async (e, i, key) => {
        // 暂存光标位置
        inputSelection.current = {
            start: focusInputEl.current.selectionStart,
            end: focusInputEl.current.selectionEnd
        };

        const { value } = e.target;

        const nextTree = await searchInitStatus(tree, choose.el, Enum.edit, { tabIndex, key, value });

        // 判断当前是要更新到样式面板，还是自定义属性面板
        if (tabIndex === 0) {
            optionArr[i].value = value;
        } else if (tabIndex === 1) {
            propsArr[i].value = value;
        }

        dispatch({
            type: 'UPDATE_TREE',
            payload: nextTree
        });
    };

    // 面板TAB切换
    const setTab = useCallback((i) => {
        dispatch({
            type: 'EDIT_CHANGE_TABNAV',
            payload: i
        });
    }, []);

    return <>
        {choose && <>
        <p className="optionTtile">{menu[choose.name].name}({choose.name})：#{choose.el}</p>
            <ul className="optionNav">
                {
                    tab.map((name, i) => <li
                        key={name}
                        className={`optionNavTab ${tabIndex === i ? 'active' : ''}`}
                        onClick={() => setTab(i)}
                    >{name}</li>)
                }
            </ul>
        </>}
        {renderOption()}
    </>;
};

export default Option;
