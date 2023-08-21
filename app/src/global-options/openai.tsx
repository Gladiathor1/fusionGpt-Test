import { FormattedMessage } from "react-intl";
import { OptionGroup } from "../core/options/option-group";

export const openAIOptions: OptionGroup = {
    id: 'openai',
    options: [
        {
            id: 'apiKey',
            defaultValue: "",
            displayOnSettingsScreen: "user",
            displayAsSeparateSection: true,
            renderProps: () => ({
                type: "nothing",
                description: <>
                </>,
            }),
        },
    ],
}