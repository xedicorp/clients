import {
    FiPlus,
    FiEdit,
    FiTrash2,
    FiMinusCircle,
    FiSave,
    FiRefreshCcw,
    FiDownload,
    FiSearch,
    FiX,
    FiPrinter,
    FiLayers,
    FiSettings,
    FiArrowRight,
    FiMenu,
    FiChevronUp,
    FiChevronDown,
} from "react-icons/fi";

import {
    FaCirclePlus,
    FaArrowLeftLong,
    FaUserLock,
    FaRegCopy,
} from "react-icons/fa6";

import { FaSyncAlt } from "react-icons/fa";
import { MdOutlineDescription } from "react-icons/md";
import { SiIfixit } from "react-icons/si";
import { HiOutlineInboxStack } from "react-icons/hi2";
import { GoContainer } from "react-icons/go";
import { GrUnlock } from "react-icons/gr";
import { BiTransferAlt } from "react-icons/bi";

const ICON_MAP = {
    create: FiPlus,
    add: FiPlus,
    edit: FiEdit,
    addCircle: FaCirclePlus,
    delete: FiTrash2,
    remove: FiMinusCircle,
    save: FiSave,
    update: FiRefreshCcw,
    generateSlip: FiDownload,
    search: FiSearch,
    close: FiX,
    closeCircle: SiIfixit,
    view: MdOutlineDescription,
    print: FiPrinter,
    bulkCreate: FiLayers,
    settings: FiSettings,
    back: FaArrowLeftLong,
    forward: FiArrowRight,
    pallet: HiOutlineInboxStack,
    container: GoContainer,
    transit: FaUserLock,
    revoke: GrUnlock,
    menu: FiMenu,
    transfer: BiTransferAlt,
    copy: FaRegCopy,
    refresh: FaSyncAlt,
    chevronUp: FiChevronUp,
    chevronDown: FiChevronDown,
};

const Icon = ({ name, size = 18, color, className, style }) => {
    const IconComponent = ICON_MAP[name];

    if (!IconComponent) {
        console.warn(`Icon "${name}" not found`);
        return null;
    }

    return (
        <IconComponent
            size={size}
            color={color}
            className={className}
            style={style}
        />
    );
};

export default Icon;
