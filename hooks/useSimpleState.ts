import React from 'react';

export default function useSimpleState(initialState: any[]) {
  const [state, setState] = React.useState<any[]>(initialState);

  function invoke (callback: (methods: any) => any) {
    setState(state => {

        callback({
            data: state,
            findOne (where: any) { return this.data?.find(item => achitetureCallback(where, item)) },
            find (where: any) { return this.data?.filter(item => achitetureCallback(where, item)) },
            updateOne (where: any, { $push, $callback, $pull, ...update }: any) {
                const just = this.findOne(where);
      
                setState(state => state?.map(item => {

                    if ($callback) {
                        Object.keys($callback)?.forEach(key => {
                            item[key] = $callback[key](item)
                        })
                    }

                    if ($push) {
                        Object.keys($push)?.forEach(key => {
                            item[key].push($push[key])
                        })
                    }

                    if ($pull) {
                        Object.keys($pull)?.forEach(key => {
                            item[key] = item[key].filter(field => field !== $pull[key])
                        })
                    }

                    if (just?._id) {
                        if (just?._id === item?._id) {
                            return { ...item, ...update }
                        }
                    } else {
                        if (just?.outstanding === item?.outstanding) {
                            return { ...item, ...update }
                        }
                    }

                    return item;
                }))

                return update
            },
            create (create: any, { inverse }: { inverse?: boolean }) {
                setState(state => inverse ? [create, ...state] : [...state, create])
                return create
            },
            removeOne (where: any) {
                const just = this.findOne(where);
                setState(state => state?.filter(item => (just?._id || just?.outstanding) === (item?._id || item?.outstanding) ))
                return just
            },
        });

        return state
    })
  }

  function achitetureCallback (where: any, item: any) {
        return Object?.keys(where)
        ?.map(key => {

            console.log('enter');
            
            
            let query = where?.[key]

            if (typeof where?.[key] === 'object') {
                if (!Array.isArray(where?.[key])) {
                    if (query?.$in) {
            console.log('meio reutnr');

                        return query?.$in?.find((q: any) => q === (item?.[key]?._id || item?.[key]))
                    } else {
                    }
                } 
            }

            console.log('meio');
            
            let dinamc = item?.[key];
            if (typeof item?.[key] === 'object') {
                if (!Array.isArray(item?.[key])) {
                        dinamc = dinamc?._id
                    } else {
            console.log('pp reutnr');
                        return dinamc?.find((field: { _id: any; }) => (field?._id || field) === where?.[key] )
                    }
            }

            console.log('passou', { dinamc, where: where?.[key] });
            
            return dinamc === where?.[key]
        })
        ?.reduce((acc, val) => acc&&val, true)
  }

  return {
      data: state,
      invoke,
      setState,
  };
}
