import React from 'react'
import { AppContentForm } from '../builder/Index'
import { GridLoader } from 'react-spinners'

export default function AppLoader() {
    return (
        <AppContentForm>
            <div style={{ display: 'flex', backgroundColor: 'transparent', alignItems: 'center', justifyContent: 'center', marginTop: '20%', }}>
                <GridLoader color="#009999" style={{ height: 15 }} />
            </div>
        </AppContentForm>
    )
}
