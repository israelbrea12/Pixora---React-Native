// src/context/LayoutContext.tsx
import React, { Component, createContext, PropsWithChildren } from 'react'; // Importa PropsWithChildren
import { LayoutMode, getLayoutMode, saveLayoutMode } from '../services/PreferencesManager';

interface LayoutContextState {
    layoutMode: LayoutMode;
    setLayoutMode: (mode: LayoutMode) => void;
}

export const LayoutContext = createContext<LayoutContextState>({
    layoutMode: 'masonry',
    setLayoutMode: () => { },
});

// --- CAMBIO: Usa PropsWithChildren para que acepte la prop 'children' ---
export class LayoutProvider extends Component<PropsWithChildren<{}>, { layoutMode: LayoutMode }> {
    constructor(props: PropsWithChildren<{}>) {
        super(props);
        this.state = {
            layoutMode: 'masonry',
        };
    }

    async componentDidMount() {
        const savedMode = await getLayoutMode();
        this.setState({ layoutMode: savedMode });
    }

    setLayoutMode = (mode: LayoutMode) => {
        this.setState({ layoutMode: mode });
        saveLayoutMode(mode);
    };

    render() {
        return (
            <LayoutContext.Provider
                value={{
                    layoutMode: this.state.layoutMode,
                    setLayoutMode: this.setLayoutMode,
                }}
            >
                {this.props.children}
            </LayoutContext.Provider>
        );
    }
}