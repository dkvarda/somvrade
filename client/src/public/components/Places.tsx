import React, { useState, useEffect } from 'react';
import TextField from '@material-ui/core/TextField';
import Autocomplete from '@material-ui/lab/Autocomplete';
import { makeStyles } from '@material-ui/core/styles';
import { VariableSizeList, ListChildComponentProps } from 'react-window';
import { Typography } from '@material-ui/core';
import SearchIcon from '@material-ui/icons/Search';
import classNames from 'classnames';
import { CollectionPointEntity, useCollectionPointsPublic } from '../../services';

const useStyles = makeStyles({
  place: {
    fontSize: '0.8rem',
  },
  searchIcon: {
    transform: 'rotate(180deg)',
  },
});

interface PlacesProps {
  selected?: string;
  county: string;
  onChange: (collectionPoint: CollectionPointEntity) => void;
  label?: string;
  size?: 'small';
  className?: string;
}

export function Places({ county, onChange, selected, label, size, className }: PlacesProps) {
  const { response, isLoading } = useCollectionPointsPublic(county);
  const [searchValue, setSearchValue] = useState('');
  const [inputValue, setInputValue] = useState('');
  const [isOpen, setOpen] = useState(false);
  const classes = useStyles();
  const value =
    selected && response ? response?.find(it => String(it.id) === String(selected)) : null;

  useEffect(() => {
    if (value) {
      setInputValue(getTextForSearchInput(value));
    }
  }, [value]);
  return (
    <Autocomplete
      open={isOpen}
      autoHighlight
      className={className}
      size={size}
      value={value}
      loading={isLoading}
      options={response || []}
      onChange={(evt, value) => {
        evt.stopPropagation();
        if (value) {
          onChange(value);
        }
      }}
      inputValue={inputValue}
      onInputChange={(evt, value, reason) => {
        if (reason !== 'reset') {
          setSearchValue(value);
          setInputValue(value);
        }
      }}
      onClose={() => {
        if (value) {
          setInputValue(getTextForSearchInput(value));
        }
        setOpen(false);
      }}
      onOpen={() => {
        setInputValue(searchValue);
        setOpen(true);
      }}
      popupIcon={<SearchIcon className={classNames(isOpen && classes.searchIcon)} />}
      getOptionLabel={option => getTextForSearchInput(option)}
      ListboxComponent={ListboxComponent as React.ComponentType<React.HTMLAttributes<HTMLElement>>}
      renderOption={option => (
        <div>
          <Typography noWrap>{option.city}</Typography>
          <Typography className={classes.place}>
            {modifyPlace(option.address, option.city)}
          </Typography>
        </div>
      )}
      renderInput={params => (
        <TextField {...params} label={label || 'Vyhľadať odberné miesto'} variant={'outlined'} />
      )}
    />
  );
}

function getTextForSearchInput(entity: CollectionPointEntity) {
  return `${entity.city}, ${modifyPlace(entity.address, entity.city)}`;
}

function modifyPlace(place: string, city: string) {
  const res = place
    .replace(city + ' - ', '')
    .replace(city + ', ', '')
    .replace(city, '');
  return res ? res : place || city;
}

const LISTBOX_PADDING = 8;

function renderRow(props: ListChildComponentProps) {
  const { data, index, style } = props;
  return React.cloneElement(data[index], {
    style: {
      ...style,
      top: (style.top as number) + LISTBOX_PADDING,
    },
  });
}

const OuterElementContext = React.createContext({});

const OuterElementType = React.forwardRef<HTMLDivElement>((props, ref) => {
  const outerProps = React.useContext(OuterElementContext);
  return <div ref={ref} {...props} {...outerProps} />;
});

function useResetCache(data: any) {
  const ref = React.useRef<VariableSizeList>(null);
  React.useEffect(() => {
    if (ref.current != null) {
      ref.current.resetAfterIndex(0, true);
    }
  }, [data]);
  return ref;
}

const ListboxComponent = React.forwardRef<HTMLDivElement>(function ListboxComponent(props, ref) {
  const { children, ...other } = props;
  const itemData = React.Children.toArray(children);
  const itemCount = itemData.length;
  const itemSize = 70;

  const getChildSize = (child: React.ReactNode) => {
    return itemSize;
  };

  const getHeight = () => {
    if (itemCount > 8) {
      return 8 * itemSize;
    }
    return itemData.map(getChildSize).reduce((a, b) => a + b, 0);
  };

  const gridRef = useResetCache(itemCount);

  return (
    <div ref={ref}>
      <OuterElementContext.Provider value={other}>
        <VariableSizeList
          itemData={itemData}
          height={getHeight() + 2 * LISTBOX_PADDING}
          width="100%"
          ref={gridRef}
          outerElementType={OuterElementType}
          innerElementType="ul"
          itemSize={index => getChildSize(itemData[index])}
          overscanCount={5}
          itemCount={itemCount}
        >
          {renderRow}
        </VariableSizeList>
      </OuterElementContext.Provider>
    </div>
  );
});
