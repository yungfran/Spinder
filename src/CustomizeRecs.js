import React, { useEffect } from "react";
import { useForm, Controller, useFieldArray } from "react-hook-form";
import "./CustomizeRecs.css";

const artistOptions = ["Artist 1", "Artist 2", "Artist 3", "Artist 4"];

function CustomizeRecs(props) {
  const { register, handleSubmit, formState: { errors }, control } = useForm();
  const { fields, append, remove } = useFieldArray({
    control,
    name: "artists",
  });

  useEffect(() => {
    if (props.taste !== undefined) {
      // Handle your initial data if needed
    }
  }, [props.taste]);

  const onSubmit = (data) => {
    console.log(data);
  };

  return (
    <div>
      <form onSubmit={handleSubmit(onSubmit)}>
        <label>Artists:</label>
        <ul>
          {fields.map((field, index) => (
            <li key={field.id}>
              <Controller
                name={`artists[${index}].name`}
                control={control}
                defaultValue={field.name}
                render={({ field }) => (
                  <div>
                    <select {...field}>
                      {artistOptions.map((option) => (
                        <option key={option} value={option}>
                          {option}
                        </option>
                      ))}
                    </select>
                    <button type="button" className="remove-button" onClick={() => remove(index)}>
                      X
                    </button>
                  </div>
                )}
              />
            </li>
          ))}
        </ul>
        {fields.length === 0 && ( // Conditional rendering for initial field
          <Controller
            name={`artists[0].name`}
            control={control}
            defaultValue=""
            render={({ field }) => (
              <div>
                <select {...field}>
                  {artistOptions.map((option) => (
                    <option key={option} value={option}>
                      {option}
                    </option>
                  ))}
                </select>
              </div>
            )}
          />
        )}
        <button type="button" onClick={() => append({ name: "" })}>
          Add Artist
        </button>
        
        <label>Valence</label>
        <input className="taste-input" defaultValue="0.5" {...register("Valence")} />
        <input className="taste-input" placeholder="Default Valence Range: .3" {...register("Valence-Range")} />

        <label>Danceability</label>
        <input className="taste-input" defaultValue="0.5" {...register("Danceability")} />
        <input className="taste-input" placeholder="Default Danceability Range: .3" {...register("Danceability-Range")} />

        
        <label>Energy</label>
        <input className="taste-input" defaultValue="0.5" {...register("Energy")} />
        <input className="taste-input" placeholder="Default Energy Range: .3"  {...register("Energy-Range")} />
        


        <label>Tempo</label>
        <input className="taste-input" defaultValue="0.5" {...register("Tempo")} />
        <input className="taste-input" placeholder="Default Tempo Range: .3" {...register("Tempo-Range")} />


        <button type="submit">Generate</button>
      </form>
    </div>
  );
}

export default CustomizeRecs;
